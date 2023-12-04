module.exports = {
    name: 'TransactCard',
    publisher: 'University of the Incarnate Word',
    cards: [{
        type: 'TransactCard',
        source: './src/cards/TransactCard',
        title: 'TransactCard Card',
        displayCardType: 'Transact Card',
        description: 'Users can check their transact account balance',
        pageRoute: {
            route: '/',
            excludeClickSelectors: ['a']
        }
    }],
    page: {
        source: './src/page/router.jsx'
    }
};