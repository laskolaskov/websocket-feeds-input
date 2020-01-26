const Rx = require('rxjs')
const rxOps = require('rxjs/operators')
const socket = require('socket.io-client')('http://localhost:3000')

console.log('Connecting ...')

let source = null
let sub = null
let connection = null

const randomProviders = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
const randomSymbols = ['USD', 'BGN', 'GBR', 'YEN']

socket.on('connect', () => {
    console.log('Connected to server !')
    console.log('Starting Feed !!!')
    source = PriceFeedFactory(1000)
    connection = source.connect()
    sub = source.subscribe(
        (data) => {
            socket.emit('feed', data)
        },
        (error) => console.error(error),
        () => console.log('Feed Completed !', arguments)
    )
})

socket.on('disconnect', () => {
    console.error('Disconnected from server !')
    if (source) {
        connection.unsubscribe()
        sub.unsubscribe()
        source = null
        console.log('Stream disconnected and unsubscribed !')
    }
})

//create random feed
const PriceFeedFactory = (dataInterval) => {
    
    //create
    //use random time interval instead of fixed
    return Rx.interval(Math.random() * (500 - 200) + 200)
        .pipe(
            rxOps.map(x => randomPricePoint()),
            rxOps.publish()
        )
}

const randomPricePoint = () => {
    return {
        value: {

            buyPrice: Math.random() * (250 - 185) + 185,
            sellPrice: Math.random() * (250 - 185) + 185,
        },
        timestamp: Date.now(),
        symbol: getRandomElement(randomSymbols),
        providerName: getRandomElement(randomProviders)
    }
}

const getRandomElement = (arr) => {
    return arr[Math.floor((Math.random() * arr.length))]
}