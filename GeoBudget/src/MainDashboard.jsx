import React, { useState, useEffect } from 'react';
import MapComponent from './HeatMapComponent';

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [heatmapdata, setHeatmapData] = useState([]);
    const [isDataFetched, setIsDataFetched] = useState(false);

    useEffect(() => {
        fetchExpenses();
        const cachedExpenses = JSON.parse(localStorage.getItem('expenses'));

        if (cachedExpenses) {
            setExpenses(cachedExpenses);
        } else {
            fetchExpenses();
            { console.log('data fetch') }
        }
    }, []);

    useEffect(() => {
        if (isDataFetched) {
            makeheatmap();
        }
    }, [isDataFetched]);


    const fetchExpenses = () => {
        fetch('http://localhost:5000/expenses')
            .then(response => response.json())
            .then(data => {
                setExpenses(data);
                setIsDataFetched(true);
                localStorage.setItem('expenses', JSON.stringify(data));
            })
            .catch(error => {
                console.error('Error fetching expenses:', error);
            });
    };

    const makeheatmap = () => {
        if (window.google && window.google.maps && window.google.maps.LatLng && isDataFetched) {
            

            setHeatmapData(expenses.map((expense) => {
                const location = new window.google.maps.LatLng(expense.lat || 0, expense.lng || 0);
                //console.log('Lat:', expense.lat, 'Lng:', expense.lng); // Add logging to check lat and lng values
                return {
                    location,
                    weight: expense?.amount || 1,
                };
            }));
        } else {
            requestAnimationFrame(makeheatmap);
        }
    };

    return (
        <div>
            <h2>Main Dashboard</h2>
            {isDataFetched && <MapComponent setHeatmapData={setHeatmapData} heatmapData={heatmapdata} />}
            
        </div>//this is an invisible map so that makeheatmap can detect that a container is created
    );
};

export default Dashboard;