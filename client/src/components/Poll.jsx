import React from 'react';
import { connect } from 'react-redux';
import { Pie } from 'react-chartjs-2';
import { vote, deletePoll } from '../store/actions';
import { color } from '../services/color';
import { withRouter } from 'react-router-dom';


const Poll = ({ poll, vote, deletePoll }) => {

  const answers =
    poll.options &&
    poll.options.map(option => (
      <button
        onClick={() => vote(poll._id, { answer: option.option })}
        className="button"
        key={option._id}>
        {option.option}
      </button>
    ));

  const mongoData = poll.options && {
    labels: poll.options.map(option => option.option),
    datasets: [
      {
        label: poll.question,
        backgroundColor: poll.options.map(option => color()),
        borderColor: '#323643',
        data: poll.options.map(option => option.votes),
      },
    ],
  };

  const contractData = poll.options && {
    labels: poll.options.map(option => option.option),
    datasets: [
      {
        label: poll.question,
        backgroundColor: poll.options.map(option => color()),
        borderColor: '#323643',
        data: poll.options.map(option => option.votes),
      },
    ],
  };

  return (
    <div>
      <div className="pie">
      <h3 className="poll-title">{poll.question}</h3>
      <h2>Infos from the smart contract</h2>
      <div className="buttons_center">{answers}</div>
        { poll.options && <Pie data={mongoData} /> }
      </div>
      <button className="btn waves-effect waves-light" onClick={() => deletePoll(poll._id)}>Delete poll</button>
      <div className="pie">
      { poll.options && <Pie data={contractData} /> }
      </div>
    </div>
  );
};

export default withRouter(connect(
  store => ({
    poll: store.currentPoll,
  }),
  { vote, deletePoll },
)(Poll));