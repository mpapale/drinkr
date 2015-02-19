define(
    [
        'jquery',
        'underscore',
        'backbone',
        'collections/Users',
        'models/Base',
        'models/User',
        'models/Wine'
    ],
    function(
        $,
        _,
        Backbone,
        UsersCollection,
        BaseModel,
        UserModel,
        WineModel
    ) {
        return BaseModel.extend(
            {
                parse: function(response) {
                    response.wine = new WineModel(response.wine, { parse: true });
                    response.taster = new UserModel(response.taster, { parse: true });
                    response.tastingPartners = new UsersCollection(response.tastingPartners, { parse: true });
                    return response;
                }
            },
            {
                // TODO push to server
                validOptions: {
                    colors: ['red','white','rose','orange'],
                    colorDepths: ['watery', 'pale', 'medium', 'deep', 'dark'],
                    colorHues: {
                        // whites:
                        'WHITE': ['greenish', 'yellow', 'straw yellow', 'gold', 'amber'],
                        // reds:
                        'RED': ['purplish', 'ruby', 'red', 'garnet', 'brick', 'brown'],
                        // rose
                        'ROSÉ': ['pink', 'salmon', 'orange', 'copper']
                    },
                    clarities: ['clear', 'slight haze', 'cloudy'],
                    aromaIntensities: ['low','moderate','aromatic','powerful'],
                    developments: ['youthful','some age','aged'],
                    sweetnesses: ['bone dry','dry','off dry','medium sweet','sweet','very sweet'],
                    bodies: ['very light','light','medium','medium-full','full-bodied','heavy'],
                    acidities: ['tart','fresh','crisp','smooth','flabby'],
                    tanninLevels: ['','low','medium','high'],
                    tanninTypes: ['','soft','round','dry','hard'],
                    balances: ['good','fair','unbalanced'],
                    excesses: ['', 'alcohol','acid','tannin','sugar'],
                    flavorIntensities: ['low','moderate','flavorful','powerful'],
                    finishes: ['short','medium','long','v. long'],
                    styles: ['traditional','in-between','modern'],
                    foodPairingMatches: ['','perfect','good','neutral','bad']
                }
            }
        );
    }
);