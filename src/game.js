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
        blackHoles: Decimal(0),
        dimensions: []
    },
    methods: {
        MatterPerSec () {
            let m = Decimal(1)

            this.dimensions.forEach(dimension => {
                m = m.times(dimension.mult)
            })

            return m
        },
        GameLoop () {
            let diff = (Date.now() - this.lastUpdate) / 1000
            this.lastUpdate = Date.now()

            this.matter = this.matter.plus(this.MatterPerSec().times(diff))

            this.dimensions.forEach(dimension => {
                dimension.mult = dimension.mult.plus(dimension.productionPerSec * diff)
            })
        },
        BuyMaxDimensions()
        {
            buyMaxDimensions(this.dimensions)
        },
        ResetForBlackHoles()
        {
            this.blackHoles = this.blackHoles.plus(getBlackHolesForMatter(this.matter))

            this.matter = Decimal(0)
            this.ClearDimensions()
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
                dimensions: '',
                lastUpdate: this.lastUpdate
            }

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
                if(data.matter !== "undefined" && data.matter !== "null") this.matter = Decimal(data.matter)
                if(data.dimensions !== "undefined" && data.dimensions !== "null") 
                {
                    let dims = JSON.parse(data.dimensions)

                    dims.forEach((dim, i) => {
                        this.dimensions[i].getDataFromObject(dim)
                    });
                }
                if(data.lastUpdate !== "undefined" && data.lastUpdate !== "null") this.lastUpdate = data.lastUpdate
                return true
            }
            catch(e)
            {
                console.log("ERROR! Couldn't load save")
                console.log(e)

                this.ResetGame()

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
            let data = loadGame(['matter', 'dimensions', 'lastUpdate'])
            
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
        async ResetGame()
        {
            const value = await swal({
                title: "Are you sure?",
                text: "You will lose everything and will not be able to recover your current save",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })

            if(!value) return

            this.matter = Decimal(0)

            this.ClearDimensions()

            this.lastUpdate = Date.now()
        }
    }
  })

game.ClearDimensions()
game.LoadGame()

loop = setInterval("game.GameLoop()", 50)
loop = setInterval("game.SaveGame(false)", 1000 * 30)