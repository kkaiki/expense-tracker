function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = (i * 360) / count;
        colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
}

function createCategoryDoughnutChart() {
    const activeTab = localStorage.getItem('activeTab');
    const storageKey = `expenses-tab-${activeTab}`;
    const expenses = JSON.parse(localStorage.getItem(storageKey));
    console.log(expenses);

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
                type: 'doughnut',
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

function createCharts() {
    createCategoryDoughnutChart();
}

document.getElementById('tab2').addEventListener('click', () => {
    createCharts();
})