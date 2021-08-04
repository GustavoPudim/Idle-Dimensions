function setStorageData(data)
{
    for(let key in data)
    {
        localStorage.setItem(key, data[key])
    }
}

function getStorageData(keys)
{
    let data = {}

    keys.forEach(key => {
        data[key] = localStorage.getItem(key)
    })

    return data
}