const nodeRadius = 15;
const height = 800, width = 1000;
const svgNode2 = d3.select('#svg-container__pattern2').append('svg').attr('class', 'svg-node')
                    .attr('width', width).attr('height', height)

svgNode2.append('defs').append('marker')
    .attr("id",'arrowhead')
    .attr('viewBox','-0 -5 10 10') //the bound of the SVG viewport for the current SVG fragment. defines a coordinate system 10 wide and 10 high starting on (0,-5)
    .attr('refX',23) // x coordinate for the reference point of the marker. If circle is bigger, this need to be bigger.
    .attr('refY',0)
    .attr('orient','auto')
    .attr('markerWidth',10)
    .attr('markerHeight',13)
    .attr('xoverflow','visible')
    .append('svg:path')
    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    .attr('fill', '#999')
    .style('stroke','none');

// 获取数据 调整成理想格式
var dataset_nodes2 = []
var dataset_links2 = []

for(let id in raw_data['agent']) {
    let obj = {}
    obj.id = id
    obj.label = raw_data['agent'][id]['prov:label']

    dataset_nodes2.push(obj)
}
for(let id in raw_data['activity']) {
    let obj = {}
    obj.id = id
    obj.label = raw_data['activity'][id]['prov:label']

    dataset_nodes2.push(obj)
}
for(let id in raw_data['entity']) {
    let obj = {}
    obj.id = id
    obj.label = raw_data['entity'][id]['prov:label']

    dataset_nodes2.push(obj)
}
// console.log(dataset_nodes, 'dataset_nodes')

for(let id in raw_data['used']) {
    let obj = {}
    obj.source = raw_data['used'][id]['prov:entity']
    obj.target = raw_data['used'][id]['prov:activity']
    obj.type = 'used'  
    obj.label = raw_data['used'][id]['prov:label']
    dataset_links2.push(obj)
}
for(let id in raw_data['wasGeneratedBy']) {
    let obj = {}
    obj.source = raw_data['wasGeneratedBy'][id]['prov:activity']
    obj.target = raw_data['wasGeneratedBy'][id]['prov:entity']
    obj.type = 'wasGeneratedBy'
    obj.label = raw_data['wasGeneratedBy'][id]['prov:label']
    dataset_links2.push(obj)
}
for(let id in raw_data['wasInformedBy']) {
    let obj = {}
    obj.source = raw_data['wasInformedBy'][id]['prov:informant']
    obj.target = raw_data['wasInformedBy'][id]['prov:informed']
    obj.type = 'wasInformedBy'
    obj.label = raw_data['wasInformedBy'][id]['prov:label']
    dataset_links2.push(obj)
}
for(let id in raw_data['wasAssociatedWith']) {
    let obj = {}
    obj.source = raw_data['wasAssociatedWith'][id]['prov:agent']
    obj.target = raw_data['wasAssociatedWith'][id]['prov:activity']
    obj.type = 'wasAssociatedWith'
    obj.label = raw_data['wasAssociatedWith'][id]['prov:label']
    dataset_links2.push(obj)
}
for(let id in raw_data['wasDerivedFrom']) {
    let obj = {}
    obj.source = raw_data['wasDerivedFrom'][id]['prov:usedEntity']
    obj.target = raw_data['wasDerivedFrom'][id]['prov:generatedEntity']
    obj.type = 'wasDerivedFrom'
    obj.label = raw_data['wasDerivedFrom'][id]['prov:label']
    dataset_links2.push(obj)
}

var line2 = d3.line()
    .curve(d3.curveCatmullRom)
    .x(d => d.x)
    .y(d => d.y);

var simulation2 = d3.forceSimulation()
            .force("link", d3.forceLink() // This force provides links between nodes
                            .id(d => d.id) // This sets the node id accessor to the specified function. If not specified, will default to the index of a node.
                            .distance(400)
             ) 
            .force("charge", d3.forceManyBody().strength(0)) // This adds repulsion (if it's negative) between nodes. 
            .force("center", d3.forceCenter(width / 2, height / 2)); // This force attracts
        
simulation2.nodes(dataset_nodes2).on("tick", ticked2);    
simulation2.force("link").links(dataset_links2);

var links2 = svgNode2.append('g')
    .style('transform', 'translate(20px, 20px)')
    .selectAll('.path')
    .data(dataset_links2)
    .enter()
    .append('path')
    .attr('class', 'path')
    .attr('id', function (d, i) {return 'edgepath2' + i})
    .attr('d', (d) => line2([{x:d.source.x, y:d.source.y}, {x:d.target.x, y:d.target.y}]))
    .attr('fill', 'none')
    .attr('stroke-width', 1)
    .attr('stroke', '#999')
    .attr('marker-end','url(#arrowhead)')   

var edgelabels2 = svgNode2.selectAll(".edgelabel")
    .data(dataset_links2)
    .enter()
    .append('text')
    .style("pointer-events", "none")
    .attr('class', 'edgelabel')
    .attr('id', function (d, i) {return 'edgelabel' + i})
    .attr('font-size', 12)
    .attr('fill', '#999')

edgelabels2.append('textPath')
    .attr('xlink:href', function (d, i) {return '#edgepath2' + i})
    .style("text-anchor", "middle")
    .style("pointer-events", "none")
    .attr("startOffset", "50%")
    .text(d => d.label);

var nodes2 = svgNode2.append('g')
    .style('transform', 'translate(20px, 20px)')
    .selectAll('.node')
    .data(dataset_nodes2)
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', function(d) {return 'translate('+ d.x + ',' + d.y +')'});

nodes2.append('circle')
    .attr('r', nodeRadius)
    .attr('fill', '#c9e3a7')

nodes2.append('text')
    .attr("dy", 4)
    .attr("dx", -15)
    .text(d => d.label)
    .style('font-size', '12px')

nodes2.call(d3.drag() //sets the event listener for the specified typenames and returns the drag behavior.
        .on("start", dragstarted2) //start - after a new pointer becomes active (on mousedown or touchstart).
        .on("drag", dragged2)      //drag - after an active pointer moves (on mousemove or touchmove).
        //.on("end", dragended)     //end - after an active pointer becomes inactive (on mouseup, touchend or touchcancel).
    );  

function ticked2() {
  nodes2.attr("transform", d => 'translate('+ d.x + ',' + d.y +')');
  links2.attr('d', d => 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y);
}

function dragstarted2(d) {
    if (!d3.event.active) simulation2.alphaTarget(0.3).restart();//sets the current target alpha to the specified number in the range [0,1].
    d.fy = d.y; //fx - the node’s fixed x-position. Original is null.
    d.fx = d.x; //fy - the node’s fixed y-position. Original is null.
}

function dragged2(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}