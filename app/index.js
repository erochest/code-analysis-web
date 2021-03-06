
const React = require('react');
const ReactDOM = require('react-dom');

/*==================================================

   API

 ***************************************************/

/**
 * Get the data from the namegame endpoint.
 *
 * The data comes back in the format:
 *
 *    [
 *        { name: 'Viju Legard', url: '...' },
 *        { name: 'Matt Seibert', url: '...' },
 *        ...
 *    ]
 */

/* ERR:
 * This is minor, but it would be nice to be consistent about using E6
 * arrow syntax and traditional function syntax, unless there's a
 * reason to deviate (which I don't see here).
 */
function getPersonList() {
    return new Promise((resolve, reject) => {
        fetch('http://api.namegame.willowtreemobile.com/').then(function(response) {
            if (response.status !== 200) {
                reject(new Error("Error!"));
            }

            response.json().then((imageList) => {
                resolve(imageList);
            });
        });
    });
}


/*==================================================

   DATA TRANSFORMS

 ***************************************************/


/* ERR:
 * Again, it's minor (although this seems less so), but be consistent
 * on how you create functions.
 */
function getLastName(fullName) {
    return fullName.match(/\w+/g)[1];
}

const getFirstName = (fullName) => {
    return fullName.match(/\w+/g)[0];
};

/**
 * Fisher-Yates shuffle
 */
function shuffleList(list) {
    // Make a copy & don't mutate the passed in list
    let result = list.slice(1);

    /* ERR:
     * The missing semicolon would have been flagged by my linter.
     * That makes me think this wasn't linted. It probably should be.
     */
    let tmp, j, i = list.length - 1

    for (; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        tmp = list[i];
        list[i] = list[j];
        list[j] = tmp;
    }

    return result;
}


/* ERR:
 * The UI element for this could stand out more. I didn't realize it
 * was there at first.
 *
 * Also, this functionality would be more helpful if it searched using
 * String.search or by breaking the name apart and return true if
 * searchForName matches the start of either name.
 */

/**
 * Remove any people that do not have the name we are
 * searching for.
 */
function filterByName(searchForName, personList) {
    return personList.filter((person) => {
        return person.name === searchForName;
    });
}


/**
 * Takes in a property of an object list, e.g. "name" below
 *
 *    people = [{ name: 'Sam' }, { name: 'Jon' }, { name: 'Kevin' }]
 *
 * And returns a function that will sort that list, e.g.
 *
 *    const sortPeopleByName = sortObjListByProp('name');
 *    const sortedPeople = sortPeopleByName(people);
 *
 *  We now have:
 *
 *    console.log(sortedPeople)
 *    > [{ name: 'Jon' }, { name: 'Kevin' }, { name: 'Sam' }]
 *
 */
function sortObjListByProp(prop) {
    return function(objList) {
        /* ERR:
         * If we're really serious about using immutable data
         * structures (or mutable data structures immutably),
         * we should probably consider using immutable.js or mori.
         */
        // Make a copy & don't mutate the passed in list
        let result = objList.slice(1);

        result.sort((a, b) => {
            if (a[prop] < b[prop]) {
                return -1;
            }

            if (a[prop] > b[prop]) {
                return 1;
            }

            /* ERR
             * This should be 0.
             */
            return 1;
        });

        return result;
    };
}

const sortByFirstName = sortObjListByProp('name');

/* ERR:
 * Umm. No. This doesn't work as advertised.
 */
const sortByLastName = (personList) => sortByFirstName(personList).reverse();


/*==================================================

   VIEW (React)

 ***************************************************/

const Search = (props) => React.DOM.input({
    type: 'input',
    onChange: props.onChange
});

const Thumbnail = (props) => React.DOM.img({
    className: 'image',
    src: props.src
});

const ListRow = (props) => React.DOM.tr({ key: props.person.name }, [
    React.DOM.td({ key: 'thumb' }, React.createElement(Thumbnail, { src: props.person.url })),
    React.DOM.td({ key: 'first' }, null, getFirstName(props.person.name)),
    React.DOM.td({ key: 'last' }, null, getLastName(props.person.name)),
]);

const ListContainer = (props) => React.DOM.table({ className: 'list-container' }, [
    React.DOM.thead({ key: 'thead' }, React.DOM.tr({}, [
        React.DOM.th({ key: 'thumb-h' }, null, 'Thumbnail'),
        React.DOM.th({ key: 'first-h' }, null, 'First Name'),
        React.DOM.th({ key: 'last-h' }, null, 'Last Name')
    ])),
    React.DOM.tbody({ key: 'tbody' }, props.personList.map((person, i) =>
        React.createElement(ListRow, { key: `person-${i}`, person })))
]);

const App = React.createClass({
    getInitialState() {
        return {
            personList: [],
            visiblePersonList: []
        };
    },

    componentDidMount() {
        getPersonList().then((personList) =>
            this.setState({
                personList,
                visiblePersonList: personList
            }));
    },

    _shuffleList() {
        this.setState({
            visiblePersonList: shuffleList(this.state.personList)
        });
    },

    _sortByFirst() {
        this.setState({
            visiblePersonList: sortByFirstName(this.state.personList)
        });
    },

    _sortByLast() {
        this.setState({
            visiblePersonList: sortByLastName(this.state.personList)
        });
    },

    _onSearch(e) {
        this.setState({
            visiblePersonList: filterByName(e.target.value, this.state.personList)
        });
    },

    render() {
        const { visiblePersonList } = this.state;

        return React.DOM.div({ className: 'app-container' }, [
            React.createElement(Search, { key: 'search', onChange: this._onSearch }),
            React.DOM.button({ key: 'shuffle', onClick: this._shuffleList }, null, 'Shuffle'),
            React.DOM.button({ key: 'sort-first', onClick: this._sortByFirst }, null, 'Sort (First Name)'),
            React.DOM.button({ key: 'sort-last', onClick: this._sortByLast }, null, 'Sort (Last Name)'),
            React.createElement(ListContainer, { key: 'list', personList: visiblePersonList })
        ]);
    }
});

ReactDOM.render(
    React.createElement(App),
    document.getElementById('app')
);
