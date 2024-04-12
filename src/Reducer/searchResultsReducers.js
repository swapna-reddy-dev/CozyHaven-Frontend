export default function searchResultsReducer(state, action) {
    switch(action.type) {
        case 'SET_BUILDINGS': {
            return {...state, data: [...action.payload]}
        }
        case 'SET_GEOAPIFY': {
            return {...state, geoapifyResult: [...action.payload]}
        }
        case 'SET_IS_SEARCH': {
            return {...state, isSearched: action.payload}
        }
        case 'SET_ISCLICKED': {
            return {...state, isClicked: [...action.payload]}
        }
        default : {
            return {...state}
        }
    }
}