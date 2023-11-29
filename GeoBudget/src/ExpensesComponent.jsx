import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddExpenseForm from './AddExpenseForm';

const ExpensesComponent = ({CallBackDatabaseConnection}) => {
    const [expenses, setExpenses] = useState([]);
    const [IsDatabaseConnected, setIsDatabaseConnected] = useState(false);
    const handleExpenseAdded = () => {
        fetchExpenses();
    };

    const handleDeleteExpense = async (expenseId) => {
        try {
            // Send a DELETE request to delete the expense by ID
            await axios.delete(`https://geobackend.onrender.com/expenses/${expenseId}`);
            // Fetch updated expenses after deletion
            fetchExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    const fetchExpenses = () => {
        fetch('https://geobackend.onrender.com/expenses')
            .then(response => response.json())
            .then(data => {
                setExpenses(data);
                localStorage.setItem('expenses', JSON.stringify(data));
                setIsDatabaseConnected(true);
            })
            .catch(error => {
                setIsDatabaseConnected(false);
                console.error('Error fetching expenses:', error);
            });
    };

    const checkconnection = async () => {//to update path for just checking health
        try {
            const response = await fetch('https://geobackend.onrender.com/expenses'); // Replace with your actual endpoint
            if (response.ok) {
                return setIsDatabaseConnected(true);
            } else {
                return setIsDatabaseConnected(false);
            }
        } catch (error) {
            console.error('Error checking database connection:', error);
            return setIsDatabaseConnected(false);
        }
    };


    useEffect(() => {
        //console.log("exp:"+ IsDatabaseConnected);
        CallBackDatabaseConnection(IsDatabaseConnected);
    }, [IsDatabaseConnected]);

    function calculateTotalAmount(expenses) {
        let totalAmount = 0;

        for (let i = 0; i < expenses.length; i++) {
            totalAmount += expenses[i].amount;
        }

        return parseFloat(totalAmount.toFixed(2));
    }

    const totalAmount = calculateTotalAmount(expenses);

    useEffect(() => {
        //setIsDatabaseConnected(checkconnection);
        checkconnection();
        //setIsDatabaseConnected(isConnected);
        const cachedExpenses = JSON.parse(localStorage.getItem('expenses'));

        if (cachedExpenses) {
            setExpenses(cachedExpenses);
        } else {
            fetchExpenses();
            //{console.log('data fetch')}
        }

        // Set up interval for periodic check (every 5 seconds)
        const intervalId = setInterval(() => {
            checkconnection();
        }, 5000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div style={{ display: 'flex' }}>
            {/* Left side with input form */}
            <div style={{ flex: 1}}>
                <h2 style={{ color: 'black' }}>Add New Expenses:</h2>
                <AddExpenseForm onExpenseAdded={handleExpenseAdded} />
            </div>

            {/* Right side with expenses table */}
            <div style={{ flex: 2, marginRight: '10px', width: '50%'}}>
                <h2 style={{ color: 'black' }}>Expenses:</h2>
                <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.tableCell}>Date</th>
                            <th style={styles.tableCell}>Name</th>
                            <th style={styles.tableCell}>Amount</th>
                            <th style={styles.tableCell}>Description</th>
                            <th style={{...styles.tableCell, width: '4vw'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map((expense) => (
                            <tr key={expense.id}>
                                <td style={{ ...styles.tableCell, padding: '0px' }}>{expense.date}</td>
                                <td style={{ ...styles.tableCell, padding: '0px' }}>{expense.name}</td>
                                <td style={{ ...styles.tableCell, padding: '0px' }}>$ {expense.amount}</td>
                                <td style={{ ...styles.tableCell, padding: '0px' }}>{expense.description}</td>
                                <td style={{ ...styles.tableCell, padding: '0px', width: '4vw' }}>
                                    <button onClick={() => handleDeleteExpense(expense.id)} style={{ padding: '10px 20px', fontSize: '14px' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                            {/* Totals row */}
                            <tr>
                                <td style={styles.boldTableCell} colSpan={2}>Total</td>
                                <td style={{ ...styles.boldTableCell, textAlign: 'center' }}>$ {totalAmount}</td>
                            </tr>
                    </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


const styles = {

    tableContainer: {
        maxHeight: '80vh',  
        //maxWidth: '60vw',  //max width
        overflowY: 'auto',  // Vertical scrollbar if content overflows
    },

    table: {
        border: '1px solid black',
        //maxWidth: '70vw',  // Adjust the width as needed
        borderCollapse: 'collapse',
        overflow: 'auto'
    },

    tableCell: {
        border: '1px solid black',
        padding: '8px',
        textAlign: 'center',
        width: '20vw',
        maxWidth: '20vw',
        overflow: 'auto',  // Add this line for the cells
     
    },

    boldTableCell: {
        border: '1px solid black',
        padding: '8px',
        textAlign: 'right',
        width: '20vw',
        maxWidth: '20vw',
        overflow: 'auto',  // Add this line for the cells
        fontWeight: 'bold',
    },
};

export default ExpensesComponent;