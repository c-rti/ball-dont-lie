let teamColors = {
    'ATL': '#CC092F',
    'BOS': '#008853',
    'BKN': '#000000',
    'CHA': '#1D8CAB',
    'CHI': '#BC032B',
    'CLE': '#860038',
    'DAL': '#1061AC',
    'DEN': '#FDB827',
    'DET': '#ED174C',
    'GSW': '#006BB6',
    'HOU': '#D31145',
    'IND': '#002D62',
    'LAC': '#D81D47',
    'LAL': '#FDB827',
    'MEM': '#6189B9',
    'MIA': '#BF2F38',
    'MIL': '#00461B',
    'MIN': '#005183',
    'NOH': '#B5985A',
    'NYK': '#F48328',
    'OKC': '#0A7EC2',
    'ORL': '#0075BD',
    'PHI': '#003DA5',
    'PHO': '#27235C',
    'POR': '#E13A3E',
    'SAC': '#724C9F',
    'SAS': '#84888B',
    'TOR': '#BE0F34',
    'UTH': '#F9A01B',
    'WAS': '#E51837'
}



let margin = {
        top: 10,
        right: 20,
        bottom: 50,
        left: 60
    },
    width = 800 - margin.left - margin.right,
    height = 750 - margin.top - margin.bottom,
    aspect = width / height;

let svg = d3.select('#plot')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

d3.select(window)
    .on('resize', function() {
        let targetWidth = svg.node().getBoundingClientRect().width;
        svg.attr('width', targetWidth);
        svg.attr('height', targetWidth / aspect)
    })
d3.csv('../data/mvp_race_2024.csv')
    .then(function(data) {
        data.forEach(function(d) {
            d.TeamColor = teamColors[d.Team];
        })

        let allGroup = [...new Set(data.map(item => item.Player))]

        let dataReady = allGroup.map(function(grpName) {
            return {
                name: grpName,
                values: data.filter(function(d) {
                    return d.Player === grpName;
                }).map(function(d) {
                    return {
                        date: d.ScrapeDate,
                        value: +d['Prob%'].slice(0, -1),
                        TeamColor: d.TeamColor
                    };
                })
            };
        });
        let startDate = d3.min(data, function(d) {
            return new Date(d.ScrapeDate);
        });
        let endDate = new Date('2024-04-14');

        let x = d3.scaleTime()
            .domain([startDate, endDate])
            .range([0, width - 30]);

        let dates = d3.timeMonths(startDate, endDate);

        let xAxis = d3.axisBottom(x)
            .tickValues(dates)
            .tickFormat(d3.timeFormat('%b %Y'));

        svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        svg.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 25) + ")")
            .style("text-anchor", "middle")
            .text("Date");

        let y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 30]);

        let yAxis = d3.axisLeft(y)
            .tickFormat(d => d + '%');

        svg.append('g')
            .call(yAxis);

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Percent(%) Chance of Winning MVP");

        let line = d3.line()
            .x(function(d) {
                return x(new Date(d.date))
            })
            .y(function(d) {
                return y(+d.value)
            })

            let latestDate = d3.max(dataReady, function(d) {
                return d3.max(d.values, function(v) {
                    return new Date(v.date);
                });
            });
    
            dataReady.sort(function(a, b) {
                let aLatestDate = new Date(a.values[a.values.length - 1].date);
                let bLatestDate = new Date(b.values[b.values.length - 1].date);
                return aLatestDate.getTime() === latestDate.getTime() ? 1 : -1;
            });
            
        svg.selectAll('myLines')
            .data(dataReady)
            .enter()
            .append('path')
            .attr('d', function(d) {
                return line(d.values)
            })
            .attr('stroke', function(d) {
                return teamColors[d.values[0].Team]
            })
            .style('stroke-width', 3)
            .style('fill', 'none')

        svg.selectAll('myLines')
            .data(dataReady)
            .enter()
            .append('path')
            .attr('d', function(d) {
                return line(d.values)
            })
            .attr('stroke', function(d) {
                return d.values[0].TeamColor
            })
            .style('stroke-width', 2)
            .style('fill', 'none')

        svg.selectAll('myDots')
            .data(dataReady)
            .enter()
            .append('g')
            .style('fill', function(d) {
                return d.values[0].TeamColor
            })
            .selectAll('myPoints')
            .data(function(d) {
                return d.values
            })
            .enter()
            .append('circle')
            .attr('cx', function(d) {
                return x(new Date(d.date))
            })
            .attr('cy', function(d) {
                return y(d.value)
            })
            .attr('r', 2.5)
            .attr('stroke', 'white')

            svg.selectAll('myLabels')
            .data(dataReady)
            .enter()
            .append('g')
            .append('text')
            .datum(function(d) {
                return {
                    name: d.name,
                    value: d.values[d.values.length - 1]
                };
            })
            .attr('transform', function(d) {
                return 'translate(' + x(new Date(d.value.date)) + ',' + y(d.value.value) + ')';
            })
            .attr('x', 12)
            .attr('y', 2.5)
            .text(function(d) {
                return d.name;
            })
            .style('fill', function(d) {
                let playerLatestDate = new Date(d.value.date);
                return playerLatestDate.getTime() === latestDate.getTime() ? d.value.TeamColor : '#808080'; // Darker gray
            })
            .style('font-size', 13.5)
            .style('opacity', function(d) {
                let playerLatestDate = new Date(d.value.date);
                return playerLatestDate.getTime() === latestDate.getTime() ? 1 : 0.5; // Less apparent
            })
            .each(function(d) {
                d.bbox = this.getBBox();
            });
        
        let labels = svg.selectAll('myLabels')
            .data(dataReady)
            .enter()
            .append('g')
            .append('text')
            .datum(function(d) {
                return {
                    name: d.name,
                    value: d.values[d.values.length - 1]
                };
            })
            .attr('transform', function(d) {
                return 'translate(' + x(new Date(d.value.date)) + ',' + y(d.value.value) + ')';
            })
            .attr('x', 12)
            .attr('y', 2.5)
            .text(function(d) {
                return d.name;
            })
            .style('fill', function(d) {
                return d.value.TeamColor
            })
            .style('font-size', 13.5)
            .each(function(d) {
                d.bbox = this.getBBox();
            });

        svg.selectAll('myLabels')
            .data(dataReady)
            .enter()
            .append('g')
            .append('text')
            .datum(function(d) {
                return {
                    name: d.name,
                    value: d.values[d.values.length - 1]
                };
            })
            .attr('transform', function(d) {
                return 'translate(' + x(new Date(d.value.date)) + ',' + y(d.value.value) + ')';
            })
            .attr('x', 12)
            .attr('y', 2.5)
            .text(function(d) {
                return d.name;
            })
            .style('fill', function(d) {
                // Check if the player's last data point matches the latest date
                let playerLatestDate = new Date(d.value.date);
                return playerLatestDate.getTime() === latestDate.getTime() ? d.value.TeamColor : '#4b4b4b';
            })
            
            .style('font-size', 13.5)
            .each(function(d) {
                d.bbox = this.getBBox();
            });

            svg.selectAll('myDots')
            .data(dataReady)
            .enter()
                .append('g')
                .style('fill', function(d){ 
                    let playerLatestDate = new Date(d.values[d.values.length - 1].date);
                    return playerLatestDate.getTime() === latestDate.getTime() ? d.values[0].TeamColor : '#808080'; // Darker gray
                })
            .selectAll('myPoints')
            .data(function(d) {return d.values })
            .enter()
            .append('circle')
                .attr('cx', function(d) { return x(new Date(d.date)) })
                .attr('cy', function(d) { return y(d.value) })
                .attr('r', 2.5)
                .attr('stroke', 'white')
                .style('opacity', function(d) { 
                    let playerLatestDate = new Date(d.date);
                    return playerLatestDate.getTime() === latestDate.getTime() ? 1 : 0.5; // Less apparent
                });

        let defs = svg.append('defs');
        let filter = defs.append('filter')
            .attr('id', 'glow');
        filter.append('feGaussianBlur')
            .attr('stdDeviation', '2.5')
            .attr('result', 'coloredBlur');
        let feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode')
            .attr('in', 'coloredBlur');
        feMerge.append('feMergeNode')
            .attr('in', 'SourceGraphic');

            svg.selectAll('myLines')
            .data(dataReady)
            .enter()
            .append('path')
            .attr('d', function(d) {
                return line(d.values)
            })
            .attr('stroke', function(d) {
                let playerLatestDate = new Date(d.values[d.values.length - 1].date);
                return playerLatestDate.getTime() === latestDate.getTime() ? d.values[0].TeamColor : '#4b4b4b'; // Darker gray
            })
            .style('stroke-width', 2)
            .style('fill', 'none')
            .style('filter', function(d) {
                let playerLatestDate = new Date(d.values[d.values.length - 1].date);
                return playerLatestDate.getTime() === latestDate.getTime() ? 'url(#glow)' : '';
            })
            .style('opacity', function(d) {
                let playerLatestDate = new Date(d.values[d.values.length - 1].date);
                return playerLatestDate.getTime() === latestDate.getTime() ? 1 : 0.5; // Less apparent
            });
    })