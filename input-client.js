const Rx = require('rxjs')
const rxOps = require('rxjs/operators')
const socket = require('socket.io-client')('http://localhost:3000')

console.log('connecting ...')

let sub
let connection

socket.on('connect', () => {
    console.log('Connected to server !')
    console.log('Starting Feed !!!')
    source = PriceFeedFactory(1000)
    connection = source.connect()
    sub = source.subscribe(
        (data) => {
            console.log(`Emmiting feed data :: ${JSON.stringify(data)}`)
            socket.emit('feed', data)
        },
        (error) => console.error(error),
        () => console.log('Feed Completed !', arguments)
    )
})

//socket.on('event', function(data){});

socket.on('disconnect', () => {
    console.error('Disconnected from server !')
    connection.unsubscribe()
    sub.unsubscribe()
    console.log('Stream disconnected and unsubscribed !')
})

const PriceFeedFactory = (dataInterval) => {
    //create random type PricePoint = Timestamp<PriceOffer>
    const randomPricePoint = () => {
        return {
            value: {
                //Math.random() * (max - min) + min;
                buyPrice: Math.random() * (250 - 185) + 185,
                sellPrice: Math.random() * (250 - 185) + 185,
            },
            timestamp: Date.now(),
            symbol: getRandomElement(randomSymbols),
            providerName: getRandomElement(randomProviders)
        }
    };
    const getRandomElement = (arr) => {
        return arr[Math.floor((Math.random()*arr.length))];
    }
    const randomProviders = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    const randomSymbols = ['USD', 'BGN', 'GBR', 'YEN']
    //create
    const pp$ = Rx.interval(dataInterval)
        .pipe(
            rxOps.map(x => randomPricePoint()),
            rxOps.publish()
        );
    //should I connect immediately ?
    //pp$.connect()
    //log
    console.log('pp$ created :: ', pp$)
    //return
    return pp$
}
