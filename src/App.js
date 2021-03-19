import React, {
  useState,
  useEffect,
  useRef,
  useReducer,
  useCallback,
} from "react";
import axios from "axios";
import styles from "./App.module.css";
import cs from "classnames";
import styled from "styled-components";
import GlobalStyle from "./GlobalStyle";
import { ReactComponent as Check } from "./Check.svg";
import circles from "svg-patterns/p/circles";
import stringify from "virtual-dom-stringify";

const pattern = circles({
  size: 24, // size of the pattern
  radius: 4,
  complement: true,
  fill: "none", // any SVG-compatible color
  strokeWidth: 1,
  stroke: "#bfadee", // any SVG-compatible color
  background: "#75b7dd", // any SVG-compatible color
});

const StyledContainer = styled.div`
  height: 100vh;
  padding: 30px;
  //background-color: #84d5d5;
  background: transparent;
  color: #171212;
`;
const StyledColumn = styled.span`
  padding: 0 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  a {
    color: inherit;
  }
  width: ${(props) => props.width};
`;
const StyledItem = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 5px;
`;
const PatternsContainer = styled.div`
  position: relative;
`;
const PatternsContent = styled.svg`
  fill: none;
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
`;
const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

const BackgroundPattern = ({ children, pttrn }) => (
  <PatternsContainer>
    <PatternsContent>
      <defs dangerouslySetInnerHTML={{ __html: stringify(pttrn) }} />
      <rect width="100%" height="100%" style={{ fill: pttrn.url() }} />
    </PatternsContent>

    {children}
  </PatternsContainer>
);

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = useState(localStorage.getItem(key) || initialState);

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

const storiesReducer = (state, action) => {
  switch (action.type) {
    case "STORIES_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "STORIES_FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case "REMOVE_STORY":
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
};

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");

  const [url, setUrl] = useState(`${API_ENDPOINT}${searchTerm}`);

  const [stories, dispatchStories] = useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false,
  });

  const handleFetchStories = useCallback(async () => {
    dispatchStories({ type: "STORIES_FETCH_INIT" });

    try {
      const result = await axios.get(url);
      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: result.data.hits,
      });
    } catch {
      dispatchStories({ type: "STORIES_FETCH_FAILURE" });
    }
  }, [url]);

  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
    event.preventDefault();
  };

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    });
  };

  return (
    <React.Fragment>
      <GlobalStyle />
      <BackgroundPattern pttrn={pattern}>
        <StyledContainer>
          <h1 className={styles.headlinePrimary}>My Hacker Stories</h1>
          <SearchForm
            searchTerm={searchTerm}
            onSearchInput={handleSearchInput}
            onSearchSubmit={handleSearchSubmit}
          />

          {stories.isError && <p>Something went wrong ...</p>}

          {stories.isLoading ? (
            <p>Loading ...</p>
          ) : (
            <List list={stories.data} onRemoveItem={handleRemoveStory} />
          )}
        </StyledContainer>
      </BackgroundPattern>
    </React.Fragment>
  );
};

const SearchForm = ({ onSearchSubmit, searchTerm, onSearchInput }) => {
  return (
    <form className={styles.searchForm} onSubmit={onSearchSubmit}>
      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={onSearchInput}
      >
        <strong>Search:</strong>
      </InputWithLabel>

      <button
        className={cs(styles.button, styles.buttonLarge)}
        type="submit"
        disabled={!searchTerm}
      >
        Submit
      </button>
    </form>
  );
};

const InputWithLabel = ({
  id,
  value,
  type = "text",
  onInputChange,
  isFocused,
  children,
}) => {
  const inputRef = useRef();

  useEffect(() => {
    if (isFocused) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label className={styles.label} htmlFor={id}>
        {children}
      </label>
      &nbsp;
      <input
        className={styles.input}
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
      />
    </>
  );
};

const List = ({ list, onRemoveItem }) =>
  list.map((item) => (
    <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
  ));

const Item = ({ item, onRemoveItem }) => (
  <StyledItem>
    <StyledColumn width="50%">
      <a href={item.url}>{item.title}</a>
    </StyledColumn>
    <StyledColumn width="30%">{item.author}</StyledColumn>
    <StyledColumn width="10%">{item.num_comments}</StyledColumn>
    <StyledColumn width="10%">{item.points}</StyledColumn>
    <StyledColumn>
      <button
        className={cs(styles.button, styles.buttonSmall)}
        type="button"
        onClick={() => onRemoveItem(item)}
      >
        <Check height="18px" width="18px" />
      </button>
    </StyledColumn>
  </StyledItem>
);

export default App;

/*The same with Class Component*/
// const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";
//
// class App extends React.Component {
//   constructor(props) {
//     super(props);
//
//     this.state = {
//       data: [],
//       isLoading: false,
//       isError: false,
//       searchTerm: localStorage.getItem("search") || "React",
//     };
//
//     this.handleSearchInput = this.handleSearchInput.bind(this);
//     this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
//     this.handleFetchStories = this.handleFetchStories.bind(this);
//     this.handleRemoveStory = this.handleRemoveStory.bind(this);
//   }
//
//   componentDidMount() {
//     this.handleFetchStories();
//   }
//
//   componentDidUpdate(prevProps, prevState) {
//     if (prevState.searchTerm !== this.state.searchTerm) {
//       localStorage.setItem("search", this.state.searchTerm);
//     }
//   }
//
//   handleSearchInput(event) {
//     this.setState({ searchTerm: event.target.value });
//   }
//
//   handleSearchSubmit(event) {
//     this.handleFetchStories();
//
//     event.preventDefault();
//   }
//
//   handleRemoveStory(item) {
//     const newStories = this.state.data.filter(
//       (story) => item.objectID !== story.objectID
//     );
//
//     this.setState({ data: newStories });
//   }
//
//   async handleFetchStories() {
//     this.setState({ isLoading: true, isError: false });
//
//     try {
//       const result = await axios.get(`${API_ENDPOINT}${this.state.searchTerm}`);
//
//       this.setState({
//         data: result.data.hits,
//         isLoading: false,
//         isError: false,
//       });
//     } catch {
//       this.setState({ isLoading: false, isError: true });
//     }
//   }
//
//   render() {
//     const { searchTerm, data, isLoading, isError } = this.state;
//
//     return (
//       <div>
//         <h1>My Hacker Stories</h1>
//
//         <SearchForm
//           searchTerm={searchTerm}
//           onSearchInput={this.handleSearchInput}
//           onSearchSubmit={this.handleSearchSubmit}
//         />
//
//         <hr />
//
//         {isError && <p>Something went wrong ...</p>}
//
//         {isLoading ? (
//           <p>Loading ...</p>
//         ) : (
//           <List list={data} onRemoveItem={this.handleRemoveStory} />
//         )}
//       </div>
//     );
//   }
// }
//
// const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }) => (
//   <form onSubmit={onSearchSubmit}>
//     <InputWithLabel
//       id="search"
//       value={searchTerm}
//       isFocused
//       onInputChange={onSearchInput}
//     >
//       <strong>Search:</strong>
//     </InputWithLabel>
//
//     <button type="submit" disabled={!searchTerm}>
//       Submit
//     </button>
//   </form>
// );
//
// class InputWithLabel extends React.Component {
//   constructor(props) {
//     super(props);
//
//     this.inputRef = React.createRef();
//   }
//
//   componentDidMount() {
//     if (this.props.isFocused) {
//       this.inputRef.current.focus();
//     }
//   }
//
//   render() {
//     const { id, value, type = "text", onInputChange, children } = this.props;
//
//     return (
//       <>
//         <label htmlFor={id}>{children}</label>
//         &nbsp;
//         <input
//           ref={this.inputRef}
//           id={id}
//           type={type}
//           value={value}
//           onChange={onInputChange}
//         />
//       </>
//     );
//   }
// }
//
// const List = ({ list, onRemoveItem }) =>
//   list.map((item) => (
//     <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
//   ));
//
// const Item = ({ item, onRemoveItem }) => (
//   <div>
//     <span>
//       <a href={item.url}>{item.title}</a>
//     </span>
//     <span>{item.author}</span>
//     <span>{item.num_comments}</span>
//     <span>{item.points}</span>
//     <span>
//       <button type="button" onClick={() => onRemoveItem(item)}>
//         Dismiss
//       </button>
//     </span>
//   </div>
// );
