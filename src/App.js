import React, { useState, useEffect } from 'react';
import {worker} from './mocks/browser';
import './App.css';

if(process.env.NODE_ENV === 'development'){
  worker.start();
}

const Button_Text_Mapping = {
  1: 'Out',
  2: 'In'
}

function Header({balance}){
  return(
    <div className="header">
      <h1>My Cashbook</h1>
      <div className="today-balance">
        Today Balance
        <br></br>
        <h1> {balance} ₹</h1>
      </div>
    </div>
  )
}

function Transaction({entry}){
  return (
    <div className="transaction">
       { entry.length === 0 ? <h3>No Entry Found! </h3>: <div className="entry"><table>{entry.map((e)=>{
          return <tr><td>{e.timestamp.toString()}<h1>{e.note}</h1></td><td className="out">Out <br></br> {e.type === 1?<h1>{`₹${e.amount}`}</h1>:'-'}</td><td className="in">In <br></br> {e.type === 2? <h1>{`₹${e.amount}`}</h1>:'-'}</td></tr>
       })}</table></div>
       }
    </div>
  )
}

function Footer({onClick}){
  return (
    <div className="action-group">
      <button className="red" onClick={()=>onClick(1)}>Out</button>
      <button className="green"  onClick={()=>onClick(2)}>In</button>
    </div>
  )
}

function Modal(props){
  const {buttonText, onCloseClick, onSubmit} = props;
  const [amount, setAmount] = useState();
  const [note, setNote] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);
  const handleSubmit = ()=>{
    const transaction = {
      type:buttonText === 'In'? 2 : 1,
      amount,
      note,
      timestamp: new Date()
    }
    onSubmit(transaction);
  }

  useEffect(()=>{
    validate();
  },[note, amount])

  const handleInputChange = (e) =>{
    setAmount(e.target.value);
  }

  const handleNoteChange = (e)=>{
    setNote(e.target.value)
  }
  
  const validate = () =>{
    if(note && amount) setIsDisabled(false);
    else setIsDisabled(true);
  }
  return (
    <div className="model">
      <div className="model-content">
        <button className="close-btn" onClick={onCloseClick}>Close</button>
        <h1>New Entry</h1>
        <input onChange={handleInputChange} value={amount} placeholder="₹0.00" type="number"></input>
        <textarea onChange={handleNoteChange} value={note} placeholder="Entry Note"/>
        <button
          disabled={isDisabled} 
          className={buttonText==='In'?'green-btn':'red-btn'}
          onClick={handleSubmit}>{buttonText}</button>
      </div>
    </div>
  )
}

function App() {
  const [showModel, setShowModel] = useState(false); 
  const [type, setType] = useState(0); 
  const [transaction, setTransaction] = useState([]);
  const [balance, setBalance] = useState(0);

  //get entries on initial render
  useEffect(()=>{
    function getEntries(){
      fetch('/entry')
      .then(res=>res.json())
      .then(data=>{
        setTransaction(data);
        calculateBalance(data);
      });
    }

    getEntries();

  }, [])

  //post entries
  useEffect(()=>{
    function postEntries(){
      fetch('/entry', {
        method: 'POST',
        body: JSON.stringify(transaction)
      })
      .then(res=>res.json())
      .then(data=>{
        console.log(data);
      });
    }

    postEntries();

  }, [transaction])

  //handle in and out button click
  const handleButtonClick = (type) =>{
    setType(type);
    setShowModel(true);
  }

  //handle close modal click
  const handleCloseClick = ()=>{
    setShowModel(false);
  }

  //calculate today's balance
  const calculateBalance = (allTransactions) =>{
    const balance = allTransactions.reduce((pValue, cValue)=>{
      let balance = pValue;
      if(cValue.type === 2){
        balance += parseFloat(cValue.amount);
      }else{
        balance -= parseFloat(cValue.amount);
      }

      return balance;
    }, 0)

    setBalance(balance);
  }

  // handle entry submit
  const handleSubmit = (transactionObj)=>{
    const allTransactions = [...transaction, transactionObj];
    setTransaction(allTransactions);
    setShowModel(false);
    calculateBalance(allTransactions);
  }

  return (
    <div className="App">
    <Header balance={balance}/>
    <Transaction entry={transaction}/>
    {showModel && <Modal buttonText={Button_Text_Mapping[type]} onCloseClick={handleCloseClick} onSubmit={handleSubmit}/>}
    <Footer onClick={handleButtonClick}/>
    </div>
  );
}

export default App;
