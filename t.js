// Load the CSV data
d3.csv('../data/mvp_race_2024.csv').then(function(data) {
    // Convert 'Prob%' to numeric values and 'ScrapeDate' to date objects
    data.forEach(d => {
        d['Prob%'] = parseFloat(d['Prob%']);
        d.ScrapeDate = new Date(d.ScrapeDate);
    });

    // Find the most recent date
    let mostRecentDate = new Date(Math.max.apply(null, data.map(d => d.ScrapeDate)));

    // Filter the data to only include records from the most recent date
    let dataMostRecent = data.filter(d => {
        let date = new Date(d.ScrapeDate);
        return date.getTime() === mostRecentDate.getTime();
    });

    // Group the data by player
    let dataByPlayer = d3.group(dataMostRecent, d => d.Player);

    // For each player, find the record with the highest 'Prob%'
    let latestData = Array.from(dataByPlayer, ([player, records]) => {
        return records.reduce((a, b) => a['Prob%'] > b['Prob%'] ? a : b);
    });

    // Sort the data by the 'Prob%' field in descending order
    latestData.sort((a, b) => d3.descending(a['Prob%'], b['Prob%']));

    // Select the top players
    let topPlayers = latestData.slice(0, 5);

    // Create a table
    let table = d3.select('body').append('table')
        .style('border-spacing', '60px 2px');

    // Create table header
    let thead = table.append('thead');
    thead.append('tr')
        .selectAll('th')
        .data(['Player', 'Prob%'])
        .enter()
        .append('th')
        .text(d => d)
        .style('text-align', 'left')

    // Create table body
    let tbody = table.append('tbody');

    // Bind the data to the table rows
    let rows = tbody.selectAll('tr')
        .data(topPlayers)
        .enter()
        .append('tr');

    // Create the table cells
    rows.selectAll('td')
        .data(d => [d.Player + ` [${d.Team}]`, d['Prob%'].toFixed(1) + '%'])
        .enter()
        .append('td')
        .text(d => d);
});
