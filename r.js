let data = [
    [
        {axis: 'PTS', value: data[Player]['']}
    ]
]
let features = ['PTS', 'TRB', 'AST', 'STL', 'BLK', 'FG%', '3P%'];

for (let i = 0; i < 3; i++) {
    let point = {}
    features.forEach(f => point[f] = 1 + Math.random() * 8);
    data.push(point);
}
// console.log(data)

let scaleList = [

    [0, 8, 16, 24, 32], //PTS
    [0, 3, 6, 9, 12], //TRB
    [0, 2, 4, 6, 8], //AST
    [0, 0.25, 0.50, 0.75, 1.00], //STL
    [0, 0.50, 1.00, 1.50, 2.00], //BLK
    [0, 15, 30, 45, 60], //FG%
    [0, 7, 14, 28, 35], //3P%

]

let width1 = 600;
let height1 = 600;
let svg1 = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

let radialScale = d3.scaleLinear()
    .domain([0,10])
    .range([0,250]);
let ticks = [2,4,6,8,10];

svg1.selectAll('circle')
    .data(ticks)
    .join(
        enter => enter.append('circle')
            .attr('cx', width / 2)
            .attr('cy', height / 2)
            .attr('fill', 'none')
            .attr('stroke', 'gray')
            .attr('r', d => radialScale(d))
    );

svg1.selectAll('.ticklabel')
    .data(ticks)
    .join(
        enter => enter.append('text')
            .attr('class', 'ticklabel')
            .attr('x', width / 2 + 5)
            .attr('y', d => height / 2 - radialScale(d))
            .text(d => d.toString())
    )

function angleToCoordinate(angle, value) {
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    return {'x': width / 2 + x, 'y': height / 2 - y};
}

let featureData = features.map((f, i) => {
    let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
    return {
        'name': f,
        'angle': angle,
        'line_coord': angleToCoordinate(angle, 10),
        'label_coord': angleToCoordinate(angle, 10.5)
    };
});

svg1.selectAll('line')
    .data(featureData)
    .join(
        enter => enter.append('line')
            .attr('x1', width / 2)
            .attr('y1', height / 2)
            .attr('x2', d => d.line_coord.x)
            .attr('y2', d => d.line_coord.y)
            .attr('stroke', 'black')
    );

svg1.selectAll('.axislabel')
    .data(featureData)
    .join(
        enter => enter.append('text')
            .attr('x', d => d.label_coord.x)
            .attr('y', d => d.label_coord.y)
            .text(d => d.name)
    )

let line = d3.line()
    .x(d => d.x)
    .y(d => d.y);
let colors = ['darkorange', 'gray', 'navy'];

function getPathCoordinates(data_point) {
    let coordinates = [];
    for (let i = 0; i< features.length; i++) {
        let ft_name = features[i];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
    }
    return coordinates;
}

svg1.selectAll('path')
    .data(data)
    .join(
        enter => enter.append('path')
            .datum(d => getPathCoordinates(d))
            .attr('d', line)
            .attr('stroke-width', 3)
            .attr('stroke', (_, i) => colors[i])
            .attr('fill', (_, i) => colors[i])
            .attr('stroke-opacity', 1)
            .attr('opacity', 0.5)
    );