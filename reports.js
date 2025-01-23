function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = (i * 360) / count;
        colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
}

document.getElementById('tab2').addEventListener('click', () => {
    const activeTab = localStorage.getItem('activeTab');
    const storageKey = `expenses-tab-${activeTab}`;
    const expenses = JSON.parse(localStorage.getItem(storageKey));

    console.log(expenses);

    const expensesChartByCategory = document.getElementById('expensesChartByCategory');

    if (window.expensesByCategoryChart) {
        window.expensesByCategoryChart.destroy();
    }

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
})