import { useState, useReducer, useCallback, useEffect } from "react";
import axios from "axios";

type Question = {
  grade: string,
  sub_category: string,
  number: number,
  title: string,
  image: string, // "http://..."
  choice: Choice[],
  commentary: string,
}

type Choice = {
  id: number,
  content: string,
  is_answer: boolean,
}

type QuestionState = {
  data: Question,
  isLoading: boolean,
}

interface QuestionFetchInitAction {
  type: "QUESTION_FETCH_INIT"
}

interface QuestionFetchSuccessAction {
  type: "QUESTION_FETCH_SUCCESS"
  payload: Question,
}

interface QuestionFetchFailAction {
  type: "QUESTION_FETCH_FAILURE"
}

type QuestionAction =
  | QuestionFetchInitAction
  | QuestionFetchSuccessAction
  | QuestionFetchFailAction

const API_ENDPOINT = "http://127.0.0.1:8000/api/v1/questions/"

const questionReducer = (
  state: QuestionState,
  action: QuestionAction
) => {
  switch (action.type) {
    case "QUESTION_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
      };
    case "QUESTION_FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        data: action.payload,
      };
    case "QUESTION_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  };
};

const App = () => {
  console.log("App rendering")
  const [questionNum, setQuestionNum] = useState(2);

  const [url, setUrl] = useState(
    `${API_ENDPOINT}${questionNum}/`
  );
  console.log(url)

  const [answerResult, setAnswerResult] = useState("")

  const [commentary, setCommentary] = useState("");

  const initialQuestionState: QuestionState = {
    data: {
      grade: "",
      sub_category: "",
      number: 0,
      title: "",
      image: "",
      choice: [],
      commentary: ""
    },
    isLoading: false,
  }

  const [question, dispatchQuestion] = useReducer(
    questionReducer,
    initialQuestionState
  )

  const handleNextQuestion = () => {
    setQuestionNum(questionNum + 1);
  };

  useEffect(() => {
    setUrl(`${API_ENDPOINT}${questionNum}/`);
    setCommentary("")
  }, [questionNum]);

  const handleFetchQuestion = useCallback(async () => {
    console.log("handleFetchQuestion rendering")
    dispatchQuestion({
      type: "QUESTION_FETCH_INIT"
    });

    try {
      const res = await axios.get(url);

      dispatchQuestion({
        type: "QUESTION_FETCH_SUCCESS",
        payload: res.data,
      });
    } catch {
      dispatchQuestion({
        type: "QUESTION_FETCH_FAILURE",
      });
    }
  }, [url]);

  useEffect(() => {
    handleFetchQuestion();
  }, [handleFetchQuestion]);

  const handleCheckAnswer = () => {
    let checkedChoice = document.getElementsByName("choice") as NodeListOf<HTMLInputElement>
    for (var i = 0; i < checkedChoice.length; i++) {
      if (question.data.choice[i].is_answer !== checkedChoice[i].checked) {
        setAnswerResult("不正解")
        break
      }
      setAnswerResult("正解")
    }

    setCommentary(question.data.commentary)
  }

  const numberIdToAlphabet = (id: number, offset: number = 0): string => {
    let a = "A".charCodeAt(0)
    return String.fromCharCode(a + id - offset)
  }

  return (
    <>
      {question.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <>
          <h1>{question.data.title}</h1>
          <form>
            {question.data.choice.map((item) => (
              <p key={item.id}>
                <label><input type="checkbox" name="choice" />
                  {numberIdToAlphabet(item.id, question.data.choice[0].id)}. {item.content}
                </label>
              </p>
            ))}
          </form>
          <button
            type="button"
            onClick={handleCheckAnswer}
          >
            Check Answer
          </button>
          <button
            type="button"
            onClick={handleNextQuestion}
          >
            Next
          </button>
          {commentary && answerResult ? (
            <>
              <p>{answerResult}</p>
              <p>
                正解は
                {question.data.choice.filter((item) => item.is_answer === true)
                  .map((item) => numberIdToAlphabet(item.id, question.data.choice[0].id))}
              </p>
              <p>{commentary}</p>
            </>
          ) : ("")}
        </>
      )}
    </>
  )
}

export default App;
