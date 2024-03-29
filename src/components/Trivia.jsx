// import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addPoints } from '../redux/actions';
import Timer from './Timer';
// import { withRouter } from 'react-router-dom';
import './Trivia.css';

class Trivia extends Component {
  state = {
    questions: [],
    questionsId: 0,
    wasAnswerSelected: false,
    // seconds: 0,
  };

  componentDidMount() {
    this.getQuestions();
  }

  // getTimer(seconds) {
  //   this.setState({
  //     seconds,
  //   });
  // }

  getQuestions = async () => {
    // const { token } = this.props;
    const token = localStorage.getItem('token');
    try {
      const URL_API_TRIVIA = `https://opentdb.com/api.php?amount=5&token=${token}`;
      // const URL_API_TRIVIA = 'https://opentdb.com/api.php?amount=5&token=null';
      const response = await fetch(URL_API_TRIVIA);
      const resultAPI = await response.json();
      this.verifyTriviaAPI(resultAPI);
    } catch (e) {
      console.log(e.message);
    }
  };

  makeArrayQuestions = (incorrects, correct) => {
    const answers = [...incorrects, correct];
    return this.shuffleArray(answers);
  };

  getPointsByDifficult = ({ difficulty }) => {
    const hardPoint = 3;
    switch (difficulty) {
    case 'easy':
      return 1;
    case 'medium':
      return 2;
    case 'hard':
      return hardPoint;
    default:
      return 0;
    }
  };

  shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  };

  verifyTriviaAPI = (resultAPI) => {
    const { history } = this.props;
    const errorCode = 0;
    if (resultAPI.response_code !== errorCode) {
      history.push('/');
      localStorage.setItem('token', '');
    } else {
      this.setState({
        questions: resultAPI.results,
      });
    }
  };

  handleAnswer = ({ target: { textContent } }) => {
    const { questions, questionsId } = this.state;
    const { dispatch } = this.props;
    this.setState({
      wasAnswerSelected: true,
    });
    console.log(questions[questionsId]);
    if (textContent === questions[questionsId].correct_answer) {
      const diffPoints = this.getPointsByDifficult(questions[questionsId]);
      const rightAnswerPoints = 10;
      const timerPoints = 2;
      dispatch(addPoints(rightAnswerPoints + (diffPoints * timerPoints)));
    }
  };

  verifyAnswerColor = (answer) => {
    const { questions, questionsId } = this.state;
    return answer === questions[questionsId].correct_answer ? (
      'correct-answer'
    ) : (
      'incorrect-answer'
    );
  };

  render() {
    const { questions, questionsId, wasAnswerSelected } = this.state;
    let countWrongAnswers = 0;
    return (
      <div>
        <Timer getTimer={ () => this.getTimer } />
        {questions.length > 0 && (
          <div>
            <h2 data-testid="question-category">
              {questions[questionsId].category}
            </h2>
            <h3 data-testid="question-text">{questions[questionsId].question}</h3>
            <div data-testid="answer-options">
              {this.makeArrayQuestions(
                questions[questionsId].incorrect_answers,
                questions[questionsId].correct_answer,
              ).map((answer) => {
                if (answer !== questions[questionsId].correct_answer) {
                  countWrongAnswers += 1;
                }
                return (
                  <button
                    key={ answer }
                    onClick={ this.handleAnswer }
                    className={ wasAnswerSelected
                      ? this.verifyAnswerColor(answer) : 'answer' }
                    data-testid={
                      answer === questions[questionsId].correct_answer
                        ? 'correct-answer'
                        : `wrong-answer-${countWrongAnswers - 1}`
                    }
                  >
                    {answer}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
}

Trivia.propTypes = {
  // token: PropTypes.string,
}.isRequired;

const mapStateToProps = (state) => ({
  token: state.tokenReducer.token,
});

export default connect(mapStateToProps)(Trivia);
