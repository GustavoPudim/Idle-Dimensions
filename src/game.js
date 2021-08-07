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
            'dimensionCost': new BlackHoleUpgrade("Decreases dim & prestige cost scaling (1.8x -> 1.65x, 1e29x -> 1e24x)", Decimal(1)),
            'prestigeBonus': new BlackHoleUpgrade("Increases prestige bonus (10x -> 15x)", Decimal(2)),
            'prestigeGap': new BlackHoleUpgrade("Decreases prestige gap (100 -> 90)", Decimal(4)),
            'matterProduction1': new BlackHoleUpgrade("Increases matter production based on current matter (2*log(m))", Decimal(6)),
            'matterProduction2': new BlackHoleUpgrade("Increases matter production based on total matter (2*log(M))", Decimal(8)),
            'startBonus': new BlackHoleUpgrade("Starts reset with one of each dim", Decimal(10)),
            'baseDimensionCost': new BlackHoleUpgrade("Decreases dims base cost (10^(n*(n + 1)/2) -> 10^(n*(n - 1)/2))", Decimal(15)),
            'multBonus': new BlackHoleUpgrade("Increases dims production based on BH's (1% per BH)", Decimal(20)),
            'eightDimension': new BlackHoleUpgrade("Unlocks 8th dimension", Decimal(50))
        },
        tabs: [
            {'id': 'dimensions', 'display': 'Dimensions', 'show': () => { return true }},
            {'id': 'options', 'display': 'Options', 'show': () => { return true }},
            {'id': 'black-hole', 'display': 'Black Hole', 'show': () => {
                if(game) return game.totalMatter.gte(Decimal('1e50')) 
                else return false
            }}
        ],
        dimensions: [
            new Dimension("1st Dimension", 1),
            new Dimension("2nd Dimension", 2),
            new Dimension("3rd Dimension", 3),
            new Dimension("4th Dimension", 4),
            new Dimension("5th Dimension", 5),
            new Dimension("6th Dimension", 6),
            new Dimension("7th Dimension", 7),
            new Dimension("8th Dimension", 8)
        ],
        loadKeys: [
            'matter',
            'totalMatter',
            'blackHoles',
            'blackHoleUpgradesBought',
            'dimensions',
            'lastUpdate'
        ]
    },
    methods: {
        MatterPerSec() 
        {
            let m = Decimal(1)

            this.dimensions.forEach(dimension => {
                m = m.times(dimension.mult)
            })

            m = this.blackHoleUpgrades.matterProduction1.bought && this.matter > 0 ? m.times(Decimal.max(1, Decimal.log10(this.matter).times(2))) : m
            m = this.blackHoleUpgrades.matterProduction2.bought && this.totalMatter > 0 ? m.times(Decimal.max(1, Decimal.log10(this.totalMatter).times(2))) : m

            return m
        },
        IncreaseMatter(m) 
        {
            this.matter = this.matter.plus(m)
            this.totalMatter = this.totalMatter.plus(m)
        },
        BuyMaxDimensions() { buyMaxDimensions(this.dimensions) },
        ResetForBlackHoles: resetForBlackHoles,
        Format(n) { return format(n) },
        ClearDimensions() { this.dimensions.forEach(dim => { dim.clearData() }) },
        GetGameData()
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
        SetGameData(data)
        {
            try 
            {
                if(data.matter) this.matter = Decimal(data.matter)
                if(data.totalMatter) this.totalMatter = Decimal(data.totalMatter)
                if(data.blackHoles) this.blackHoles = Decimal(data.blackHoles)

                if(data.blackHoleUpgradesBought)
                {
                    let BHUsBought = JSON.parse(data.blackHoleUpgradesBought)

                    for(let key in this.blackHoleUpgrades)
                    {
                        this.blackHoleUpgrades[key].bought = BHUsBought[key]
                    }
                }

                if(data.dimensions) 
                {
                    let dims = JSON.parse(data.dimensions)

                    dims.forEach((dim, i) => {
                        this.dimensions[i].getDataFromObject(dim)
                    });
                }

                if(data.lastUpdate) this.lastUpdate = data.lastUpdate
                
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
        SaveGame(withAlert = false)
        {
            setStorageData(this.GetGameData())
            console.log("Game Saved")  

            if(!withAlert) return
            
            swal({ title: "Your game has been saved", icon: "success" })
            
        },
        LoadGame(withAlert = false)
        {
            this.SetGameData(getStorageData(this.loadKeys))

            if(!withAlert) return

            swal({ title: "Your game has been loaded", icon: "success" })
        },
        ExportGame()
        {
            navigator.clipboard.writeText(btoa(JSON.stringify(this.GetGameData())))

            swal("Save text copied to clipboard")
        },
        async ImportGame()
        {
            const value = await swal({ title: "Paste your save text here:", buttons: true, content: "input" })

            if(!value) return

            try
            {
                let data = JSON.parse(atob(value))
                
                if(this.SetGameData(data)) swal("Your save has been successfully imported!", { icon: "success" });
            }
            catch(e) 
            {
                swal("ERROR!", { text: "Your save text couldn't be imported", icon: "error" });
                console.log(e)
            }
        },
        async ResetGame(withAlert = true)
        {
            if(withAlert)
            {
                const value = await swal({
                    title: "Are you sure?",
                    text: "You will erase all your progress and will not recieve any bonus",
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

loop = setInterval("gameLoop()", 50)
loop = setInterval("game.SaveGame(false)", 1000 * 30)