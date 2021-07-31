const dimensionNames = [
    "1st Dimension",
    "2nd Dimension",
    "3rd Dimension",
    "4th Dimension",
    "5th Dimension",
    "6th Dimension",
    "7th Dimension"
]

var game = new Vue({
    el: '#game',
    data: {
        currentTab: "dimensions",
        lastUpdate: Date.now(),
        buyAmount: 1,
        matter: Decimal(0),
        totalMatter: Decimal(0),
        blackHoles: Decimal(0),
        blackHoleUpgrades: {
            'dimensionCost': new BlackHoleUpgrade("Decreases dim & prestige cost scaling (1.8x -> 1.7x, 1e29x -> 1e24x)", Decimal(1)),
            'prestigeBonus': new BlackHoleUpgrade("Increases prestige bonus (10x -> 15x)", Decimal(2)),
            'prestigeGap': new BlackHoleUpgrade("Decreases prestige gap (100 -> 90)", Decimal(5)),
            'matterProduction1': new BlackHoleUpgrade("Increases matter production based on current matter (logM / 2)", Decimal(10)),
            'matterProduction2': new BlackHoleUpgrade("Increases matter production based on total matter (logM / 2)", Decimal(25)),
            'startBonus1': new BlackHoleUpgrade("Starts reset with one of each dim until 4th", Decimal(50)),
            'startBonus2': new BlackHoleUpgrade("Starts reset with one of each dim", Decimal(100)),
            'baseDimensionCost': new BlackHoleUpgrade("Decreases dim base cost (10x smaller)", Decimal(250)),
            'multBonus': new BlackHoleUpgrade("Increases dims production based on BH's (0.1% per BH)", Decimal(1000))
        },
        tabs: [
            {'id': 'dimensions', 'display': 'Dimensions', 'show': () => { return true }},
            {'id': 'options', 'display': 'Options', 'show': () => { return true }},
            {'id': 'black-hole', 'display': 'Black Hole', 'show': () => {
                if(game) return game.totalMatter.gte(Decimal('1e50')) 
                else return false
            }}
        ],
        dimensions: []
    },
    methods: {
        MatterPerSec () {
            let m = Decimal(1)

            this.dimensions.forEach(dimension => {
                m = m.times(dimension.mult)
            })

            m = this.blackHoleUpgrades.matterProduction1.bought && this.matter > 0 ? m.times(Decimal.log10(this.matter).div(2)) : m
            m = this.blackHoleUpgrades.matterProduction2.bought && this.totalMatter > 0 ? m.times(Decimal.log10(this.totalMatter).div(2)) : m

            return m
        },
        IncreaseMatter(m) {
            this.matter = this.matter.plus(m)
            this.totalMatter = this.totalMatter.plus(m)
        },
        GameLoop () {
            let diff = (Date.now() - this.lastUpdate) / 1000
            this.lastUpdate = Date.now()
            
            this.IncreaseMatter(this.MatterPerSec().times(diff))

            this.dimensions.forEach(dimension => {
                dimension.mult = dimension.mult.plus(dimension.productionPerSec * diff)
            })
        },
        BuyMaxDimensions()
        {
            buyMaxDimensions(this.dimensions)
        },
        async ResetForBlackHoles()
        {
            const value = await swal({
                title: "Are you sure?",
                text: "You will lose your matter and all your dimensions",
                icon: "warning",
                buttons: true
            })

            if(!value) return

            this.blackHoles = this.blackHoles.plus(getBlackHolesForMatter(this.matter))

            this.matter = Decimal(0)
            this.ClearDimensions()

            if(!this.blackHoleUpgrades.startBonus1.bought) return

            for(let i = 0; i < 4; i ++)
            {
                this.dimensions[i].amount = 1
            }

            if(!this.blackHoleUpgrades.startBonus2.bought) return

            for(let i = 4; i < this.dimensions.length; i ++)
            {
                this.dimensions[i].amount = 1
            }
        },
        Format(number)
        {
            if(number.lte(1000)) return number.toFixed(2)
            power = Decimal.log10(number).floor()
            mantissa = number.div(Decimal.pow(10, power))
            return mantissa.toFixed(2) + "e" + power
        },
        GetData()
        {
            let data = {
                matter: this.matter.toString(),
                totalMatter: this.totalMatter.toString(),
                blackHoles: this.blackHoles.toString(),
                blackHoleUpgradesBought: '',
                dimensions: '',
                lastUpdate: this.lastUpdate
            }

            let BHUsBought = {}

            for(let key in this.blackHoleUpgrades)
            {
                BHUsBought[key] = this.blackHoleUpgrades[key].bought
            }

            data.blackHoleUpgradesBought = JSON.stringify(BHUsBought)

            let dims = []

            this.dimensions.forEach(dim => {
                dims.push(dim.asObject())
            });

            data.dimensions = JSON.stringify(dims)

            return data
        },
        SetData(data)
        {
            try 
            {
                if(data.matter !== undefined && data.matter !== "null") this.matter = Decimal(data.matter)
                if(data.totalMatter !== undefined && data.totalMatter !== "null") this.totalMatter = Decimal(data.totalMatter)
                if(data.blackHoles !== undefined && data.blackHoles !== "null") this.blackHoles = Decimal(data.blackHoles)

                if(data.blackHoleUpgradesBought !== undefined && data.blackHoleUpgradesBought !== "{}")
                {
                    let BHUsBought = JSON.parse(data.blackHoleUpgradesBought)

                    for(let key in this.blackHoleUpgrades)
                    {
                        this.blackHoleUpgrades[key].bought = BHUsBought[key]
                    }
                }

                if(data.dimensions !== undefined && data.dimensions !== "{}") 
                {
                    let dims = JSON.parse(data.dimensions)

                    dims.forEach((dim, i) => {
                        this.dimensions[i].getDataFromObject(dim)
                    });
                }

                if(data.lastUpdate !== undefined && data.lastUpdate !== "null") this.lastUpdate = data.lastUpdate
                
                return true
            }
            catch(e)
            {
                console.log("ERROR! Couldn't load save")
                console.log(e)  

                this.ResetGame(false)

                return false
            }
        },
        SetDataFromB64(data)
        {
            try
            {
                return this.SetData(JSON.parse(atob(data)))
            }
            catch (e)
            {
                console.log("ERROR! Couldn't load save")
                console.log(e)
                return false 
            }
        },
        SaveGame(withAlert)
        {
            saveGame(this.GetData())
            if(withAlert)
            {
                swal({
                title: "Your game has been saved",
                icon: "success"
              })
            }
            else 
            {
                console.log("Game Saved")
            }
        },
        LoadGame()
        {
            let data = loadGame([
                'matter',
                'totalMatter',
                'blackHoles',
                'blackHoleUpgradesBought',
                'dimensions',
                'lastUpdate'])
            
            this.SetData(data)
        },
        ExportGame()
        {
            navigator.clipboard.writeText(exportGame(this.GetData()))
            swal("Save text copied to clipboard")
        },
        async ImportGame()
        {
            const value = await swal({
                title: "Paste your save text here:",
                buttons: true,
                content: "input"
              })
            if (value) {
                console.log()
                const sucess = this.SetDataFromB64(value)

                if(sucess)
                {
                    swal("Your save has been successfully imported!", {
                    icon: "success",});
                }
                else
                {
                    swal("ERROR!", {
                        text: "Your save text couldn't be imported",
                        icon: "error"});
                }
            }
        },
        ClearDimensions()
        {
            this.dimensions = []

            for(let i = 0; i < dimensionNames.length; i++)
            {
                this.dimensions[i] = new Dimension(dimensionNames[i], i + 1)
            }
        },
        async ResetGame(alert = true)
        {
            if(alert)
            {
                const value = await swal({
                    title: "Are you sure?",
                    text: "You will lose everything and will not be able to recover your current save",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                })

                if(!value) return
            }

            this.matter = Decimal(0)

            this.ClearDimensions()

            this.lastUpdate = Date.now()
        },
        SetTab(tab)
        {
            this.currentTab = tab
        },
        CheckTab(tab)
        {
            return this.currentTab === tab
        }
    }
  })

game.ClearDimensions()
game.LoadGame()

loop = setInterval("game.GameLoop()", 50)
loop = setInterval("game.SaveGame(false)", 1000 * 30)