import React, { useState, useEffect} from 'react';
import MapComponent from './MapComponent';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainDashboard from './MainDashboard';
import ExpensesComponent from './AddExpenses';
import ExpensesTable from './ExpensesTable';
import AIChat from './AIChat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPowerOff, faFeatherPointed, faCircleUser} from '@fortawesome/free-solid-svg-icons';
import { GoogleOAuthProvider, GoogleLogin, googleLogout} from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

library.add(faPowerOff, faFeatherPointed,faCircleUser);

const GeoBudget = () => {
    //const serverlink='https://geobackend.onrender.com';
    //const serverlink='http://localhost:5000/';
    const serverlink='https://geobackend.fly.dev/';
    const [expenses, setExpenses] = useState([]);
    const [DataOption, setDataOption] = useState("null");
    const [IsSignedin, setIsSignedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [power, setPower] = useState(false);
    const [chatHistory, setChatHistory] = useState([
        { role: 'assistant', content: "Hi, I'm FinanceAI. How can I help you today?" },
    ]);

    const [DemoData, setDemoData] = useState([]);

    const Demoinfo = [{ amount: 5.25, date: "2023-11-19", description: "Demo", id: 1, lat: 43.88311072589884, lng: -79.42899667734373, name: "THAI BASIL" },
    { amount: 10, date: "2023-11-22", description: "Demo", id: 2, lat: 43.648511336460345, lng: -79.45822902217506, name: "Bags" },
    { amount: 15, date: "2023-11-26", description: "Demo", id: 3, lat: 43.68642129894634, lng: -79.49096488028763, name: "Burger" },
    { amount: 45, date: "2023-11-30", description: "Demo", id: 4, lat: 43.671324767421275, lng: -79.46833981860428, name: "Mcdonalds" },
    { amount: 50, date: "2023-12-05", description: "Demo", id: 5, lat: 43.68625993409024, lng: -79.40879054561256, name: "Tickets" },
    { amount: 20, date: "2023-12-10", description: "Demo", id: 6, lat: 43.653225, lng: -79.383186, name: "Coffee Shop" },
    { amount: 35, date: "2023-12-15", description: "Demo", id: 7, lat: 43.6622719, lng: -79.3854297, name: "Bookstore" },
    { amount: 25, date: "2023-12-20", description: "Demo", id: 8, lat: 43.6563221, lng: -79.3809161, name: "Electronics Store" },
    { amount: 15, date: "2023-12-25", description: "Demo", id: 9, lat: 43.6602225, lng: -79.3825811, name: "Park" },
    { amount: 30, date: "2023-12-30", description: "Demo", id: 10, lat: 43.6694032, lng: -79.4259675, name: "Ice Cream Shop" },]

    const setExpensesCallback = (data) => {
        setExpenses(data);
    };

    const addMessageToChat = (message) => {
        setChatHistory((prevHistory) => [...prevHistory, message]);
      };

    const handleLoginSuccess = async (response) => {
        setIsSignedIn(true);
        if(DataOption==='demo'){
            setDataOption('server');
            fetchExpenses();
        }

        const profileObj = jwtDecode(response.credential)
        setUser(profileObj);    
    };

    useEffect(() => {
        if (IsSignedin && DataOption === 'server') {
            fetchExpenses();
        }
    }, [IsSignedin]); // Dependency array ensures useEffect runs when isSignedIn or DataOption changes

    const handleLogout = () => {
        googleLogout();
        setIsSignedIn(false);
        setUser(null);
        if(DataOption=='server')
        {
            setExpenses([])
        }
      };

    const fetchLocalExpenses = () => {
        const items = []

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
    
            // Check if the key contains 'FinanceAI'
            if (key.includes('FinanceAI')) {
              // Retrieve the value from local storage
              const value = localStorage.getItem(key);
                
              // Parse the value (assuming it's stored as JSON)
              try {
                const valueObject = JSON.parse(value);
                items.push(valueObject);
              } catch (error) {
                // Handle JSON parsing error if needed
                console.error(`Error parsing JSON for key ${key}: ${error.message}`);
              }
            }
        }
        setExpenses(items);
    };

    const fetchExpenses = async () => {
        if(IsSignedin)
        {
            try {
                // Assuming user is an object with an email property
                const userEmail = user.email;
                
                // Display loading state if needed
        
                const response = await fetch(`${serverlink}/getexpenses`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: userEmail,
                    }),
                });
        
                if (!response.ok) {
                    throw new Error(`Failed to fetch expenses. Status: ${response.status}`);
                }
              
                const data = await response.json();
               
                setExpenses(data);
        
                // Remove loading state if needed
            } catch (error) {
                console.error('Error fetching expenses:', error);
                // Handle the error, possibly show an error message to the user
            }
        }
    };

    useEffect(() => {
        checkconnection();
        setDataOption(localStorage.getItem('dataoption')) //gets cached storage option for ease of repeat use

        switch (localStorage.getItem('dataoption')) {
            case 'demo':
                setDataOption('demo');
                setDemoData(Demoinfo);
                break;
            case 'local':
                setDataOption('local');
                fetchLocalExpenses();
                break
            case 'server':
                setDataOption('server');
                fetchExpenses();
                break
            default:
                setDataOption('demo');
                setDemoData(Demoinfo);
        }

        // Set up interval for periodic check (every 2 seconds)
        const intervalId = setInterval(() => {
            checkconnection();
        }, 2000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    const checkconnection = async () => {//to update path for just checking health
        try {
            const response = await fetch(serverlink + "/"); 
            if (response.ok) {
                return setPower(true);
            } else {
                return setPower(false);
            }
        } catch (error) {
            console.error('Error checking database connection:', error);
            return setPower(false);
        }
    };

    const handleDataOptionClick = (option) => {
        setDataOption(option);
        //localStorage.setItem('key', 'value');
        if (option == 'demo' && !IsSignedin){
            setDemoData(Demoinfo);
            localStorage.setItem('dataoption','demo');
        }
        else if (option == 'local'){
            setDemoData([]);
            setExpenses([]);
            localStorage.setItem('dataoption','local');
            fetchLocalExpenses();
        }
        else if (option == 'server') {
            setDemoData([]);
            setExpenses([]);
            localStorage.setItem('dataoption','server');
            fetchExpenses();
        }
      };


    const styles = {
        navLink: {
            textDecoration: 'none',
            textAlign: 'center',
            color: 'black',
            padding: '10px',
            marginBottom: '5px',
            borderRadius: '10px',
            border: '3px solid black',
            backgroundColor: 'none', 
            display: 'block',
            fontSize: '17px', 
            transition: 'background-color 0.3s', 
        },
    };

    return (
        <Router>
            <div style={{ display: 'flex', minHeight: '100vh',height: 'auto', width: 'auto', overflow: 'auto' }}>
                {/* Sidebar */}
                <div style={{ width: '200px', background: '#f0f0f0', padding: '20px', display: 'flex', flexDirection: 'column', borderRight: '1px solid black' }}>
                    
                    <div style={{fontWeight: 'bold', color: 'black', fontSize: '16px', display: 'flex', justifyContent: 'center'}}>
                         Welcome {user?.name ?? 'Guest-Demo'}
                    </div>
                    <div style={{ marginBottom: '20px', marginTop: '20px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>  
                        <FontAwesomeIcon icon={faCircleUser} style={{ color: power ? 'green' : 'red', fontSize: 120 }}/>
                    </div>

                    {/* Navigation Links */}
                    <nav style={{ listStyleType: 'none', padding: 0 }}>
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                        <li>
                                <Link to="/" style={styles.navLink} onMouseOver={(e) => e.target.style.backgroundColor = 'lightgray'} onMouseOut={(e) => e.target.style.backgroundColor = ''}>
                                    FinanceAI
                                </Link>
                            </li>
                            <li>
                                <Link to="/DashBoard" style={styles.navLink} onMouseOver={(e) => e.target.style.backgroundColor = 'lightgray'} onMouseOut={(e) => e.target.style.backgroundColor = ''}>
                                    Dashboard Analytics
                                </Link>
                            </li>
                            <li>
                                <Link to="/expenses" style={styles.navLink} onMouseOver={(e) => e.target.style.backgroundColor = 'lightgray'} onMouseOut={(e) => e.target.style.backgroundColor = ''}>
                                    Add Expenses
                                </Link>
                            </li>
                            <li>
                                <Link to="/expensestable" style={styles.navLink} onMouseOver={(e) => e.target.style.backgroundColor = 'lightgray'} onMouseOut={(e) => e.target.style.backgroundColor = ''}>
                                    Expenses Table
                                </Link>
                            </li>
                        </ul>
                    </nav>
                    <div style={{paddingBottom: '10px',fontWeight: 'bold', color: 'black', fontSize: '16px', display: 'flex', justifyContent: 'center'}}>
                         Storage Options
                    </div>
                    
                <div style={{ fontWeight: 500, fontSize: '16px'}}>
                    {!IsSignedin ? (
                    <div className="mb-2">
                        <label style={{ color: DataOption === 'demo' ? 'green' : 'black' }}>
                        <input
                            type="radio"
                            name="saveOption"
                            className="mr-2"
                            checked={DataOption === 'demo'}
                            onChange={() => handleDataOptionClick('demo')}
                            style={{
                                transform: 'scale(1.2)',
                            }}
                        />
                        Random Data (Demo)
                        </label>
                    </div>):null}

                    <div className="mb-2">
                        <label style={{ color: DataOption === 'local' ? 'green' : 'black' }}>
                        <input
                            type="radio"
                            name="saveOption"
                            className="mr-2"
                            checked={DataOption === 'local'}
                            onChange={() => handleDataOptionClick('local')}
                            style={{ transform: 'scale(1.2)' }}
                        />
                        Local Storage
                        </label>
                    </div>

                    <div className="mb-2">
                        <label style={{ color: DataOption === 'server' ? 'green' : 'black' }}>
                        <input
                            type="radio"
                            name="saveOption"
                            className="mr-2"
                            checked={DataOption === 'server'}
                            onChange={() => handleDataOptionClick('server')}
                            style={{ transform: 'scale(1.2)' }}
                        />
                        {power ? 'Server Database': 'Server Connecting...'} 
                        </label>
                    </div>
                </div>
      
                    <div style={{padding: '10px', fontWeight: 'bold', color: 'black', fontSize: '16px', display: 'flex', justifyContent: 'center'}}>
                        Account
                    </div>
                    
                    <div style={{display: 'flex', justifyContent: 'center'}}>
                        {IsSignedin ? (
                            <button onClick={handleLogout}>Logout</button>
                            ) : (
                            <GoogleOAuthProvider clientId={import.meta.env.VITE_API_KEY1}>
                            <GoogleLogin
                            onSuccess={handleLoginSuccess}
                            onError={() => {
                            console.log('Login Failed');
                            }}
                            />
                            </GoogleOAuthProvider>
                        )}   
                    </div>
                    {/*<div style={{ marginBottom: '20px', marginTop: '20px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>  
                        <FontAwesomeIcon icon={faPowerOff} style={{ color: power ? 'green' : 'red', fontSize: 120 }}/>
                    </div>
                    <div style={{ color: power ? 'green' : 'red', fontWeight: 'bold', fontSize: '12px', display: 'flex', justifyContent: 'center' }}>
                        {power ? 'Connected to Server' : 'Connecting to Server...'} 
                        </div>#*/}
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '20px' }}>
                    <Routes>
                        <Route path="/" element={<AIChat expenses={expenses} chatHistory={chatHistory} addMessageToChat={addMessageToChat} power={power} serverlink={serverlink} DataOption={DataOption} DemoData={DemoData}/>} />
                        <Route path="/DashBoard" element={<MainDashboard expenses = {expenses} setExpenses = {setExpensesCallback} IsSignedin={IsSignedin} DemoData={DemoData} setDemoData={setDemoData} DataOption={DataOption}/>} />
                        <Route path="/expenses" element={<ExpensesComponent expenses = {expenses} setExpenses = {setExpensesCallback} IsSignedin={IsSignedin} DemoData={DemoData} setDemoData={setDemoData} serverlink={serverlink} DataOption={DataOption} user={user} fetchExpenses={fetchExpenses} fetchLocalExpenses={fetchLocalExpenses}/>} />
                        <Route path="/expensestable" element={<ExpensesTable expenses = {expenses} setExpenses = {setExpensesCallback} IsSignedin={IsSignedin} DemoData={DemoData} setDemoData={setDemoData} serverlink={serverlink} DataOption={DataOption} fetchExpenses={fetchExpenses} fetchLocalExpenses={fetchLocalExpenses}/>} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};



export default GeoBudget;