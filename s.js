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

let padding = {
        top: 25,
        right: 0,
        bottom: 25,
        left: 30
    },
    width = 940,
    height = 460;

let svg = d3.select('#plot')
    .attr('width', width + padding.left)
    .attr('height', height + padding.top + padding.bottom)
    .attr('transform', 'translate(40' + ', ' + padding.top+')')

svg.append('text')
    .attr('x', (10))
    .attr('y', padding.top/2)
    .attr('class', 'mvp-title')
    .text('NBA MVP Race')

let main = svg.append('g')
    .classed('main', true)
let overlay = main.append('rect')
    .attr('class', 'overlay')
    .attr('width', width)
    .attr('height', height - padding.bottom)
    .attr('transform', 'translate(5, 30)')
    .style({'stroke': 'none', 'pointer-events': 'all'})

let overlay_rect = d3.select('overlay')

d3.csv('../data/mvp_race_2024.csv')
    .then(function(data) {
        let processedData = [];
        data.forEach(function(d) {
            d.TeamColor = teamColors[d.Team];
            let playerData = processedData.find(p => p.Player === d.Player);
            if (playerData) {
                let lastDate = new Date(playerData.values[playerData.values.length - 1].ScrapeDate);
                let currentDate = new Date(d.ScrapeDate);
                lastDate.setDate(lastDate.getDate() + 1);
                while (lastDate < currentDate) {
                    playerData.values.push({ScrapeDate: new Date(lastDate), Prob: null});
                    lastDate.setDate(lastDate.getDate() + 1);
                }
            } else {
                processedData.push({Player: d.Player, values: []});
                playerData = processedData[processedData.length - 1];
            }
            playerData.values.push({ScrapeDate: new Date(d.ScrapeDate), Prob: d.Prob});
        });

        function hexToRGBA(hex, alpha) {
            let r = parseInt(hex.slice(1, 3), 16),
                g = parseInt(hex.slice(3, 5), 16),
                b = parseInt(hex.slice(5, 7), 16);
        
            if (alpha) {
                return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
            } else {
                return "rgb(" + r + ", " + g + ", " + b + ")";
            }
        }

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
            .classed('x axis', true)
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        let y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 30]);

        let yAxis = d3.axisLeft(y)
            .tickFormat(d => d + '%');

        svg.append('g')
            .classed('y axis', true)
            .attr('transform', 'translate(30,0)')
            .call(yAxis);

        svg.append("text")
            .classed('y-axis-title', true)
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - padding.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Percent(%) Chance of Winning MVP")

        let line = d3.line()
            .x(function(d) {
                return x(new Date(d.date))
            })
            .y(function(d) {
                return y(+d.values)
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


        let hoverLine = svg
            .append('path')
            .attr('stroke', '#000')
            .attr("stroke-width", '1px')
            .attr("pointer-event", 'none')
        
        // Mouse events
        overlay_rect
            .on('mousemove', function() {
                mousex = d3.pointer(this);
                hoverLine.style('display', null).attr('d', function() {
                    let d = "M" + (mousex[0]+padding.left) + "," + (height - padding.bottom);
                    d += " " + (mousex[0] + padding.left) + "," + padding.top;
                    return d;
                })
            }).on('mouseout', function() {
                mousex = d3.pointer(this);
                mousex = mousex[0] + 5;
                hoverLine.style("display", 'none')
            });
            
        
        main.selectAll('myLabels')
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
                if (playerLatestDate.getTime() == latestDate.getTime()) {
                    return d.value.TeamColor;
                } else {
                    return hexToRGBA(d.value.TeamColor, 0.2)
                }
            })
            .style('font-size', 13.5)
            .each(function(d) {
                d.bbox = this.getBBox();
            });
        

        main.selectAll('myDots')
            .data(dataReady)
            .enter()
                .append('g')
                .style('fill', function(d){ 
                    let playerLatestDate = new Date(d.values[d.values.length - 1].date);
                    if (playerLatestDate.getTime() === latestDate.getTime()) {
                        return d.values[0].TeamColor;
                    } else {
                        return hexToRGBA(d.values[0].TeamColor, 0.2);
                    }
                })
            .selectAll('myPoints')
            .data(function(d) { return d.values.filter(function(d) { return d.value }); })
            .enter()
            .append('circle')
                .attr('cx', function(d) { return x(new Date(d.date)) })
                .attr('cy', function(d) { return y(d.value) })
                .attr('r', 2.5)
                .attr('stroke', 'white')
                .style('opacity', function(d) { 
                    let playerLatestDate = new Date(d.date);
                    return playerLatestDate.getTime() === latestDate.getTime() ? 1 : 0.2;
                });
            
        let defs = main.append('defs');
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

            main.selectAll('myLines')
                .data(dataReady)
                .enter()
                .append('path')
                .attr('d', function(d) {
                    return d3.line()
                        .defined(function(d) { return d.values !== null; }) // Ignore the 'null' values
                        .x(function(d) { return x(new Date(d.date)) })
                        .y(function(d) { return y(d.value) })
                        (d.values);
                })
                .attr('stroke', function(d) {
                    let playerLatestDate = new Date(d.values[d.values.length - 1].date);
                    return playerLatestDate.getTime() === latestDate.getTime() ? d.values[0].TeamColor : hexToRGBA(d.values[0].TeamColor, 0.2);
                })
                .style('stroke-width', 2)
                .style('fill', 'none')
                .style('filter', function(d) {
                    let playerLatestDate = new Date(d.values[d.values.length - 1].date);
                    return playerLatestDate.getTime() === latestDate.getTime() ? 'url(#glow)' : '';
                })
    })