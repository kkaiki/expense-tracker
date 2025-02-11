function generateColor(index, multiplier = 100) {
    return `hsl(${index * multiplier}, 70%, 50%)`;
}

function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(generateColor(i));
    }
    return colors;
}

function createCategoryDoughnutChart() {
    const activeTab = localStorage.getItem('activeTab');
    const storageKey = `expenses-tab-${activeTab}`;
    const expenses = JSON.parse(localStorage.getItem(storageKey));

    const expensesChartByCategory = document.getElementById('expensesChartByCategory');

    if (!expensesChartByCategory) {
        console.error('Canvas element "expensesChartByCategory" not found');
        return;
    }

    if (window.expensesByCategoryChart) {
        window.expensesByCategoryChart.destroy();
    }

    try {
        if (Object.keys(expenses.resume.category).length > 0) {
            window.expensesByCategoryChart = new Chart(expensesChartByCategory, {
                type: 'pie',
                data: {
                    labels: Object.keys(expenses.resume.category),
                    datasets: [{
                        label: 'Expenses by Category',
                        data: Object.values(expenses.resume.category),
                        backgroundColor: generateColors(Object.keys(expenses.resume.category).length),
                        hoverOffset: 4
                    }]
                }
            });
        } else {
            document.getElementById('expensesChartError').innerHTML = '<p>No expenses found for this month.</p>';
        }
    } catch (error) {
        console.error('Failed to create chart:', error);
    }
}

function createDailyExpensesChart() {
    const activeTab = localStorage.getItem('activeTab');
    const storageKey = `expenses-tab-${activeTab}`;
    const { expenses } = JSON.parse(localStorage.getItem(storageKey));

    const dailyExpenses = document.getElementById('dailyExpensesChart');

    if (!dailyExpenses) {
        console.error('Canvas element "dailyExpenses" not found');
        return;
    }

    if (window.dailyExpensesChartJS) {
        window.dailyExpensesChartJS.destroy();
    }

    try {
        if (expenses.length > 0) {
            const groupedData = {};
            expenses.forEach(expense => {
                const { date, category, amount } = expense;
                if (!groupedData[date]) groupedData[date] = {};
                if (!groupedData[date][category]) groupedData[date][category] = 0;
                groupedData[date][category] += amount;
            });

            const categories = [...new Set(expenses.map(exp => exp.category))];

            const labels = Object.keys(groupedData).sort(); 
            const datasets = categories.map((category, index) => ({
                label: category,
                data: labels.map(date => groupedData[date][category] || 0),
                backgroundColor: generateColor(index)
            }));

            console.log(datasets);

            window.dailyExpensesChartJS = new Chart(dailyExpenses, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    plugins: { legend: { position: "top" } },
                    scales: {
                        x: { stacked: true },
                        y: { stacked: true, beginAtZero: true }
                    }
                }
            });
        } else {
            document.getElementById('dailyExpensesChartError').innerHTML = '<p>No expenses found for this month.</p>';
        }
    } catch (error) {
        console.error('Failed to create chart:', error);
    }
}

function createCharts() {
    createCategoryDoughnutChart();
    createDailyExpensesChart();
}

document.getElementById('tab2').addEventListener('click', () => {
    createCharts();
})