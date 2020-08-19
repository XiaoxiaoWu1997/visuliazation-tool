var new_elements_nodes = []
var new_elements_edges = []
var sortByNameState = false
var sortByFreqState = false
Promise.all([
    fetch('cy-style.json')
        .then(function(res) {
        return res.json();
        }),
    fetch('data.json')
        .then(function(res) {
        return res.json();
        })
])
.then(function(dataArray) {
    // window.addEventListener('DOMContentLoaded', function(){
        var raw_data = dataArray[1]
        var file_data = JSON.stringify(raw_data, null, "\t")
        var fileName = 'data.json'
        var elements = {}
        elements.nodes = []
        elements.edges = []
        var othersType = []
        var cateTypeList = []

        /* 根据类型返回颜色 */
        function parentColorByType(category, id) {
            let types = ['task','address', 'socket', 'path', 'packet', 'process_memory', 'file']
            // for(let id in raw_data[category]) {
                if(raw_data[category][id]['prov:type'] === 'task') {
                    return '#1F6ED4'
                } else if(raw_data[category][id]['prov:type'] === 'address') {
                    return '#5bd1d7'
                } else if(raw_data[category][id]['prov:type'] === 'socket') {
                    return '#ffb549'
                } else if(raw_data[category][id]['prov:type'] === 'path') {
                    return '#e41749'
                } else if(raw_data[category][id]['prov:type'] === 'packet') {
                    return '#3DC7BE'
                } else if(raw_data[category][id]['prov:type'] === 'process_memory') {
                    return '#ff502f'
                } else if(raw_data[category][id]['prov:type'] === 'file') {
                    return '#86269b'
                }else {
                    return '#4C6085'
                }
            // }
        }

        /* 找到其他类型push到 othersType */
        function othersTypeFunc(raw_data) {
            let othersType = []
            for(let key in raw_data) {
                if(key === 'agent' || key === 'activity' || key === 'entity') {
                    for(let id in raw_data[key]) {
                        let type = raw_data[key][id]['prov:type']
                        if(type !== 'task' && type !== 'address' && type !== 'socket' && type !== 'path' &&
                        type !== 'packet' && type !== 'process_memory' && type !== 'file') {
                            if(othersType.indexOf(raw_data[key][id]['prov:type']) < 0) {
                                othersType.push(raw_data[key][id]['prov:type'])
                            }
                        }
                    }
                }
            }
            return othersType
        }

        /* 工具函数：根据id找到节点类型 */ 
        function findNodeType(id) {
            for(let key in raw_data) {
                if (raw_data[key][id]) {
                    return raw_data[key][id]['prov:type']
                }
            }
        }

        /* 工具函数：计算节点频率 注意 */
        function calculateNodeFreq(id) {
            let frequencyCount = 0
            for(let key in raw_data) {
                if (key !== 'agent' && key !== 'activity' && key !=='entity') {
                //    console.log('???')
                    for(let key2 in raw_data[key]) {
                        if(raw_data[key][key2]['prov:entity'] === id || raw_data[key][key2]['prov:activity'] === id 
                        || raw_data[key][key2]['prov:informant'] === id || raw_data[key][key2]['prov:informed'] === id
                        || raw_data[key][key2]['prov:agent'] === id || raw_data[key][key2]['prov:activity'] === id
                        || raw_data[key][key2]['prov:usedEntity'] === id || raw_data[key][key2]['prov:generatedEntity'] === id) {
                            frequencyCount++
                        }
                    }
                }
            }
            return frequencyCount
        }

        /* 准备数据 */
        function loadNodesData(raw_data) {
            let elements = {}
            elements.nodes = []
            /* node数据 */
            for(let key in raw_data) {
                if(key === 'agent' || key === 'activity' || key === 'entity') {
                    for(let id in raw_data[key]) {
                        let category = key
                        let obj = {}
                        obj.group = 'nodes'
                        obj.data = {}
                        obj.data.id = id
                        obj.data.parent = raw_data[key][id]['cf:id']
                        obj.data.label = (raw_data[key][id]['prov:label']?raw_data[key][id]['prov:label']:raw_data[key][id]['prov:type'])+ '  ' + raw_data[key][id]['cf:id']
                        obj.classes = 'center-right'
                        obj.data.freq = calculateNodeFreq(id)
                        if(raw_data[category][id]['prov:type'] === 'task') {
                            obj.data.shapeType = 'ellipse'
                            obj.data.type = 'task'
                        } else if(raw_data[category][id]['prov:type'] === 'address') {
                            obj.data.shapeType = 'triangle'
                            obj.data.type = 'address'
                        } else if(raw_data[category][id]['prov:type'] === 'socket') {
                            obj.data.shapeType = 'rectangle'
                            obj.data.type = 'socket'
                        } else if(raw_data[category][id]['prov:type'] === 'path') {
                            obj.data.shapeType = 'pentagon'
                            obj.data.type = 'path'
                        } else if(raw_data[category][id]['prov:type'] === 'packet') {
                            obj.data.shapeType = 'diamond'
                            obj.data.type = 'packet'
                        } else if(raw_data[category][id]['prov:type'] === 'process_memory') {
                            obj.data.shapeType = 'hexagon'
                            obj.data.type = 'process_memory'
                        } else if(raw_data[category][id]['prov:type'] === 'file') {
                            obj.data.shapeType = 'tag'
                            obj.data.type = 'file'
                        } else {
                            obj.data.shapeType = 'vee'
                            obj.data.type = raw_data[category][id]['prov:type']
                        }
                        elements.nodes.push(obj)
        
                        let ids = elements.nodes.map(item => {return item.data.id})
                        if(ids.indexOf(raw_data[key][id]['cf:id']) === -1) {
                            let obj2 = {}
                            obj2.data = {}
                            obj2.data.id = raw_data[key][id]['cf:id']
                            obj2.data.isParent = true
                            obj2.data.type = raw_data[key][id]['prov:type']
                            obj2.data.parentColor = parentColorByType(key, id)
                            elements.nodes.push(obj2)
                        }
                    }
                }
            }
            return elements.nodes
        }

        function loadEdgesData(raw_data) {
            let elements = {}
            elements.edges = []
            for(let id in raw_data['used']) {
                let obj = {}
                obj.group = 'edges'
                obj.data = {}
                obj.data.source = raw_data['used'][id]['prov:entity']
                obj.data.target = raw_data['used'][id]['prov:activity']
                obj.data.sourceType = findNodeType(obj.data.source)
                obj.data.targetType = findNodeType(obj.data.target)
                obj.data.type = 'used'
                obj.data.label = 'used  ' + raw_data['used'][id]['prov:label']
                obj.data.isMerge = false
                obj.classes = 'autorotate edgeCate-used'
                elements.edges.push(obj)
            }
            for(let id in raw_data['wasGeneratedBy']) {
                let obj = {}
                obj.group = 'edges'
                obj.data = {}
                obj.data.source = raw_data['wasGeneratedBy'][id]['prov:activity']
                obj.data.target = raw_data['wasGeneratedBy'][id]['prov:entity']
                obj.data.sourceType = findNodeType(obj.data.source)
                obj.data.targetType = findNodeType(obj.data.target)
                obj.data.type = 'wasGeneratedBy'
                obj.data.label = 'wasGeneratedBy  ' + raw_data['wasGeneratedBy'][id]['prov:label']
                obj.data.isMerge = false
                obj.classes = 'autorotate edgeCate-wasGeneratedBy'
                elements.edges.push(obj)
            }
            for(let id in raw_data['wasInformedBy']) {
                let obj = {}
                obj.group = 'edges'
                obj.data = {}
                obj.data.source = raw_data['wasInformedBy'][id]['prov:informant']
                obj.data.target = raw_data['wasInformedBy'][id]['prov:informed']
                obj.data.sourceType = findNodeType(obj.data.source)
                obj.data.targetType = findNodeType(obj.data.target)
                obj.data.type = 'wasInformedBy'
                obj.data.label = 'wasInformedBy  ' + raw_data['wasInformedBy'][id]['prov:label']
                obj.data.isMerge = false
                obj.classes = 'autorotate edgeCate-wasInformedBy'
                elements.edges.push(obj)
            }
            for(let id in raw_data['wasAssociatedWith']) {
                let obj = {}
                obj.group = 'edges'
                obj.data = {}
                obj.data.source = raw_data['wasAssociatedWith'][id]['prov:agent']
                obj.data.target = raw_data['wasAssociatedWith'][id]['prov:activity']
                obj.data.sourceType = findNodeType(obj.data.source)
                obj.data.targetType = findNodeType(obj.data.target)
                obj.data.type = 'wasAssociatedWith'
                obj.data.label = 'wasAssociatedWith  ' + raw_data['wasAssociatedWith'][id]['prov:label']
                obj.data.isMerge = false
                obj.classes = 'autorotate edgeCate-wasAssociatedWith'
                elements.edges.push(obj)
            }
            for(let id in raw_data['wasDerivedFrom']) {
                let obj = {}
                obj.group = 'edges'
                obj.data = {}
                obj.data.source = raw_data['wasDerivedFrom'][id]['prov:usedEntity']
                obj.data.target = raw_data['wasDerivedFrom'][id]['prov:generatedEntity']
                obj.data.sourceType = findNodeType(obj.data.source)
                obj.data.targetType = findNodeType(obj.data.target)
                obj.data.type = 'wasDerivedFrom'
                obj.data.label = 'wasDerivedFrom  ' + raw_data['wasDerivedFrom'][id]['prov:label']
                obj.data.isMerge = false
                obj.classes = 'autorotate edgeCate-wasDerivedFrom'
                elements.edges.push(obj)
            }

            return elements.edges
        }

        elements.nodes = loadNodesData(raw_data)
        elements.edges = loadEdgesData(raw_data)
        othersType = othersTypeFunc(raw_data)

        // 放大缩小 不用变
        var panZoomDefaults = {
            zoomFactor: 0.05, // zoom factor per zoom tick
            zoomDelay: 45, // how many ms between zoom ticks
            minZoom: 0.1, // min zoom level
            maxZoom: 10, // max zoom level
            fitPadding: 200, // padding when fitting
            panSpeed: 10, // how many ms in between pan ticks
            panDistance: 10, // max pan distance per tick
            panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
            panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
            panInactiveArea: 8, // radius of inactive area in pan drag box
            panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
            zoomOnly: true, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)
            fitSelector: undefined, // selector of elements to fit
            animateOnFit: function(){ // whether to animate on fit
                return false;
            },
            fitAnimationDuration: 1000, // duration of animation on fit
            // icon class names
            sliderHandleIcon: 'fa fa-minus',
            zoomInIcon: 'fa fa-plus',
            zoomOutIcon: 'fa fa-minus',
            resetIcon: 'fa fa-expand'
        };

        // 初始化视图2
        var cy2 = cytoscape({
            container: document.getElementById('my-graph-canvas__pattern2'),
            boxSelectionEnabled: false,
            autounselectify: true,
            layout: {name: 'dagre'},
            style: dataArray[0],
            elements: elements
            });

        cy2.panzoom( panZoomDefaults );
        cy2.viewport({
            zoom: 0.07,
            pan: { x: 350, y: 60 }
          });
        // cy2.layout( { name: 'circle', radius: 10 } );

        /* 工具函数: 删除数组中的指定元素 */
        function removeArrElem(arr, val) {
            if(val === 'others') {
                for(let key of othersType) {
                    arr.splice(arr.indexOf(key), 1);
                }
            } else {
                let index = arr.indexOf(val);
                if (index > -1) {
                    arr.splice(index, 1);
                }
            }
            return arr
        };

        /* 提前把所有节点类型弄出来 */
        function allNodeType() {
            let arr = []
            for(let key in raw_data) {
               if (key === 'agent' || key === 'activity' || key ==='entity') {
                   for(let key2 in raw_data[key]) {
                        if(arr.indexOf(raw_data[key][key2]['prov:type']) < 0) {
                            arr.push(raw_data[key][key2]['prov:type'])
                        }
                   }
               }
            }
            return arr
        }

        /* 更新数据 */
        function updateData(cateTypeList) {
            // 多选：核心代码
            let newElements = {}
            if(cateTypeList.length > 0) {
                let filterNodesStr = 'd => '
                for(let index in cateTypeList) {
                    // console.log(cateTypeList[index], '????')
                    if(String(index) === '0') {
                        filterNodesStr += 'd.data.type === cateTypeList['+ index +']'
                    } else {
                        filterNodesStr += '|| d.data.type === cateTypeList['+ index +']'
                    }
                }
                newElements.nodes = elements.nodes.filter(eval(filterNodesStr))

                let filterEdgesStr = 'd => '
                let filterEdgesStrSource = ''
                let filterEdgesStrTarget = ''
                let joinStr = ''
                for(let index in cateTypeList) {
                    if(String(index) === '0') {
                        filterEdgesStrSource += 'd.data.sourceType === cateTypeList['+index+']'
                    } else {
                        filterEdgesStrSource += '|| d.data.sourceType === cateTypeList['+index+']'
                    }
                }
                for(let index in cateTypeList) {
                    if(String(index) === '0') {
                        filterEdgesStrTarget += 'd.data.targetType === cateTypeList['+index+']'
                    } else {
                        filterEdgesStrTarget += '|| d.data.targetType === cateTypeList['+index+']'
                    }
                }
                joinStr = '(' + filterEdgesStrSource + ') && (' + filterEdgesStrTarget + ')'
                newElements.edges =  elements.edges.filter(eval(filterEdgesStr+joinStr))
            }
            

            return newElements
        }

        /* 类型按钮交互 */
        var cateBtns = document.getElementsByClassName('my-node-category__btn')
        for (let i=0; i < cateBtns.length; i++) {
            cateBtns[i].addEventListener('click', selectCateBtn, true)     
        }
        function selectCateBtn(e) {
            if(e.target.getAttribute('class').indexOf('cate-btn__active') < 0) {
                e.currentTarget.classList.add('cate-btn__active')
                // 防止点击两次 把选择的选项push到选项数组
                if(cateTypeList.indexOf(e.currentTarget.id) < 0 ) {
                    if(e.currentTarget.id === 'others') {
                        // 把剩余的类型push进去 去重
                        for(let key of othersType) {
                            if(cateTypeList.indexOf(key) < 0) {
                                cateTypeList.push(key)
                            }
                        }
                    } else {
                        cateTypeList.push(e.currentTarget.id)
                    }
                }
                updateCanvas(cateTypeList)
                
                new_elements_nodes = updateData(cateTypeList).nodes
                sortByNameState = false
                sortByFreqState = false
                document.getElementById('my-sortbyname__btn').style.backgroundColor = '#fff'
                document.getElementById('my-sortbyfreq__btn').style.backgroundColor = '#fff'
                // new_elements_nodes.sort(function(a, b) {
                //     return (a.data.label + '').localeCompare(b.data.label + '')
                // })
                updateNodesColunm(new_elements_nodes)
            } else {
                cateTypeList = removeArrElem(cateTypeList, e.currentTarget.id)
                e.currentTarget.classList.remove('cate-btn__active')
                updateCanvas(cateTypeList)
                if(cateTypeList.length === 0) {
                    cy2.destroy()
                }
                new_elements_nodes = updateData(cateTypeList).nodes
                sortByNameState = false
                sortByFreqState = false
                document.getElementById('my-sortbyname__btn').style.backgroundColor = '#fff'
                document.getElementById('my-sortbyfreq__btn').style.backgroundColor = '#fff'
                // new_elements_nodes.sort(function(a, b) {
                //     return (a.data.label + '').localeCompare(b.data.label + '')
                // })
                updateNodesColunm(new_elements_nodes)
            }
        }

         /* 更新视图 */
        function updateCanvas(cateTypeList) {
            for(let obj of cy2.nodes()) {
                obj.style('display', 'none')
            }
            let filterNodesStr = ''
            for(let index in cateTypeList) {
                if(String(index) === '0') {
                    filterNodesStr += "element.data('type') === cateTypeList["+ index +"]"
                } else {
                    filterNodesStr += "|| element.data('type') === cateTypeList["+ index +"]"
                }
            }

            let collection = cy2.filter(function(element, i){
                return eval('element.isNode() && (' + filterNodesStr + ')')
            });

            for(let obj of collection) {
                obj.style('display', 'element')
            }
        }

        /* 更新节点栏 */
        function updateNodesColunm(new_elements_nodes) {
            var myNodeListBox = document.getElementById('my-node-list__box')
            // 清空节点
            var childs = myNodeListBox.childNodes; 
            for(var i = childs.length - 1; i >= 0; i--) { 
                myNodeListBox.removeChild(childs[i]); 
            }
            // 更新竖栏的节点
            for(let key in new_elements_nodes) {
                let nodeDiv = document.createElement('div')
                let label = new_elements_nodes[key].data.label?new_elements_nodes[key].data.label:'group '+new_elements_nodes[key].data.id
                let freq = new_elements_nodes[key].data.freq?`(Freq:` +new_elements_nodes[key].data.freq +`)`:''
                nodeDiv.innerHTML +=
                    ` <div class="custom-control custom-checkbox my-check-box">
                        <input type="checkbox" checked class="custom-control-input my-check-input" value="` + new_elements_nodes[key].data.id + `" name="my-check-node" id="check-input-`+ key +`">
                        <label class="custom-control-label" for="check-input-`+ key +`">`+ label + ' ' + freq + `</label>
                    </div>`
                myNodeListBox.appendChild(nodeDiv)
            }
            // 给节点绑定事件
            var myCheckInputs = document.getElementsByName('my-check-node')
            
            for(let index = 0; index < myCheckInputs.length; index++) {
                myCheckInputs[index].addEventListener('click', selectCheckInput)
            }
        }

        updateNodesColunm(elements.nodes)
       
        /* 首字母排序 */
        document.getElementById('my-sortbyname__btn').addEventListener('click', sortByName)
        function sortByName() {
            if(sortByNameState === false) {
                sortByNameState = true
                sortByFreqState = false
                document.getElementById('my-sortbyname__btn').style.backgroundColor = '#e4e6ea'
                document.getElementById('my-sortbyfreq__btn').style.backgroundColor = '#fff'
                if(new_elements_nodes.length > 0) {
                    new_elements_nodes.sort(function(a, b) {
                        return (a.data.label + '').localeCompare(b.data.label + '')
                    })
                    updateNodesColunm(new_elements_nodes)
                } else {
                    let temp_elements_nodes = elements.nodes
                    temp_elements_nodes.sort(function(a, b) {
                        return (a.data.label + '').localeCompare(b.data.label + '')
                    })
                    updateNodesColunm(temp_elements_nodes)
                }
                
            } else {
                sortByNameState = false
                document.getElementById('my-sortbyname__btn').style.backgroundColor = '#fff'
                if(new_elements_nodes.length > 0) {
                    updateNodesColunm(updateData(cateTypeList).nodes)
                } else {
                    updateNodesColunm(elements.nodes)
                }
            }
        }

        /* 首字母排序 */
        document.getElementById('my-sortbyfreq__btn').addEventListener('click', sortByFreq)
        function sortByFreq() {
            if(sortByFreqState === false) {
                sortByFreqState = true
                sortByNameState = false
                document.getElementById('my-sortbyfreq__btn').style.backgroundColor = '#e4e6ea'
                document.getElementById('my-sortbyname__btn').style.backgroundColor = '#fff'
                if(new_elements_nodes.length > 0) {
                    new_elements_nodes.sort(function(a, b) {
                        return b.data.freq - a.data.freq;
                    })
                    updateNodesColunm(new_elements_nodes)
                } else {
                    let temp_elements_nodes = elements.nodes
                    temp_elements_nodes.sort(function(a, b) {
                        return b.data.freq - a.data.freq;
                    })
                    updateNodesColunm(temp_elements_nodes)
                }
                
            } else {
                sortByFreqState = false
                document.getElementById('my-sortbyfreq__btn').style.backgroundColor = '#fff'
                if(new_elements_nodes.length > 0) {
                    updateNodesColunm(updateData(cateTypeList).nodes)
                } else {
                    updateNodesColunm(elements.nodes)
                }
                
            }
        }

        /* 多选节点筛选 */
        function selectCheckInput() {
            for(let obj of cy2.nodes()) {
                obj.style('display', 'none')
            }
            var myCheckInputs = document.getElementsByName('my-check-node')
            var checkIds = []
            for(let index in myCheckInputs) {
                if(myCheckInputs[index].checked) {
                    checkIds.push(myCheckInputs[index].value)
                }
            } 
            // 相当于更新视图
            let filterNodesStr = ''
            for(let index in checkIds) {
                if(String(index) === '0') {
                    filterNodesStr += "element.data('id') === checkIds["+ index +"]"
                } else {
                    filterNodesStr += "|| element.data('id') === checkIds["+ index +"]"
                }
            }

            let collection = cy2.filter(function(element, i){
                return eval('element.isNode() &&(' + filterNodesStr + ')');
              });

            for(let obj of collection) {
                obj.style('display', 'element')
            }
        }

        /* 更新节点的筛选结果-返回数据 */
        function updateByNodes(checkIds) {
            let newElements = {}
            // if(cateTypeList.length > 0) {
                let filterNodesStr = 'd => '
                for(let index in checkIds) {
                    if(String(index) === '0') {
                        filterNodesStr += 'd.data.id === checkIds['+ index +']'
                    } else {
                        filterNodesStr += '|| d.data.id === checkIds['+ index +']'
                    }
                }
                newElements.nodes = elements.nodes.filter(eval(filterNodesStr))
            
                let filterEdgesStr = 'd => '
                let filterEdgesStrSource = ''
                let filterEdgesStrTarget = ''
                let joinStr = ''
                for(let index in checkIds) {
                    if(String(index) === '0') {
                        filterEdgesStrSource += 'd.data.source === checkIds['+index+']'
                    } else {
                        filterEdgesStrSource += '|| d.data.source === checkIds['+index+']'
                    }
                }
                for(let index in checkIds) {
                    if(String(index) === '0') {
                        filterEdgesStrTarget += 'd.data.target === checkIds['+index+']'
                    } else {
                        filterEdgesStrTarget += '|| d.data.target === checkIds['+index+']'
                    }
                }
                joinStr = '(' + filterEdgesStrSource + ') && (' + filterEdgesStrTarget + ')'
                newElements.edges =  elements.edges.filter(eval(filterEdgesStr+joinStr))
            // }
            return newElements
        }

        /* 唯一id */
        function uuid() {
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = "-";
        
            var uuid = s.join("");
            return uuid;
        }

        /* 画粗边 */
        function drawBoldEdges() {
            var recordST = []
            for(let edge of cy2.edges()) {
                let sourceId = edge.data().source
                let targetId = edge.data().target
                let type = edge.data().type
                let sourceType = edge.data().sourceType
                let targetType = edge.data().targetType
                let collection = cy2.filter(function(element, i){
                    return element.isEdge() &&(element.data('source') === sourceId && element.data('target') === targetId);
                });
    
                if(collection.length > 1) {
                    for(let obj of collection) {
                        if(!obj.data().isMerge) {
                            obj.style('display', 'none')
                        }
                    }
                    if(recordST.indexOf(sourceId+targetId) === -1) {
                        // 添加单边
                        let array = [{  
                            group: "edges",
                            data: { 
                                id: uuid(),
                                label: type,
                                source: sourceId,
                                target: targetId,
                                sourceType: sourceType,
                                targetType: targetType, 
                                type: type,
                                isMerge: true
                            },
                            classes: "boldline edgeCate-"+ type
                        }]
                        cy2.add(array)
                        recordST.push(sourceId+targetId)
                    } 
                }
            }
        }
        drawBoldEdges()
        
        /* 边：交互 */
        function tapEdges() {
            cy2.on('tap', 'edge', function(evt) {
                let sourceId = evt.target.data().source
                let targetId = evt.target.data().target
                if(evt.target.data().isMerge) {
                    let collection = cy2.filter(function(element, i){
                        return element.isEdge() &&(element.data('source') === sourceId && element.data('target') === targetId);
                    });
                    for(let obj of collection) {
                        if(!obj.data().isMerge) {
                            obj.style('display', 'element')
                        } else {
                            obj.style('display', 'none')
                        }
                    }
                } else {
                    let collection = cy2.filter(function(element, i){
                        return element.isEdge() &&(element.data('source') === sourceId && element.data('target') === targetId);
                    });
                    if(collection.length > 1) {
                        for(let obj of collection) {
                            if(!obj.data().isMerge) {
                                obj.style('display', 'none')
                            } else {
                                obj.style('display', 'element')
                            }
                        }
                    }
                }      
            });
        }
        tapEdges()

        /* 搜索节点功能 */ 
        var searchInput2 = document.getElementById('my-search-input-copy')
        var searchBtn = document.getElementById('my-search-btn')
        searchInput2.addEventListener('change', searchNodeByName)
        searchBtn.addEventListener('click', searchNodeByName)
        function searchNodeByName(e) {
            let collection = null
            if(e.target.value) {
                collection = cy2.filter(function(element, i){
                    return element.isNode() && element.data('label') === e.target.value;
                });
            } else {
                collection = cy2.filter(function(element, i){
                    return element.isNode() && element.data('label') === searchInput2.value;
                });
            }

            if(collection.length > 0) {
                let id = collection[0].data('id')
                collection.addClass('highlight-node');
                cy2.animate({
                    fit: {
                        eles: cy2.getElementById(id),
                        padding: 300
                      }
                  }, {  duration: 200  },
                  {
                    "transition-timing-function": "ease-in-out" 
                  });
            }
        }

        /* 取消浏览器默认右击事件 */
        document.oncontextmenu = function() {
            return false;
        }

        /* 右击节点取消高亮 */
        function cxttapNodes() {
            cy2.on('cxttap', 'node', function(evt){
                evt.target.removeClass('highlight-node')
            })    
        }
        cxttapNodes()

        /* 左击高亮节点 */
        function tapNodes() {
            cy2.on('tap', 'node', function(evt){
                if(!evt.target.data('isParent')) {
                    // 禁点组合框
                    evt.target.toggleClass('highlight-node')
                    evt.target.removeClass('opacity')
                    
                    let collectionParent = cy2.filter(function(element, i){
                        return element.isNode() &&(element.data('id') === evt.target.data('parent'));
                    });
                    
                    let collectionEdge = cy2.filter(function(element, i){
                        return element.isEdge() &&(element.data('source') === evt.target.data('id') || element.data('target') === evt.target.data('id'));
                    });
                    if(evt.target.classes().indexOf('highlight-node') !== -1) {
                        collectionEdge.addClass('highlight-edge')
                        collectionParent.addClass('highlight-node-sec')
                        collectionEdge.removeClass('opacity')
                        collectionParent.removeClass('opacity')
                        for(let obj of collectionEdge) {
                            let collectionOtherNode = null
                            let collectionOtherParent = null
                            if(obj.data('source') !== evt.target.data('id')) {
                                collectionOtherNode = cy2.filter(function(element, i){
                                    return element.isNode() && (element.data('id') === obj.data('source') );
                                });
                                
                            } else if(obj.data('target') !== evt.target.data('id')) {
                                collectionOtherNode = cy2.filter(function(element, i){
                                    return element.isNode() && (element.data('id') === obj.data('target') );
                                });
                            }
                            collectionOtherParent = cy2.filter(function(element, i){
                                return element.isNode() && (element.data('id') === collectionOtherNode[0].data('parent') );
                            });
                            collectionOtherParent.addClass('highlight-node-sec')
                            collectionOtherNode.addClass('highlight-node-sec')
                            collectionOtherNode.removeClass('opacity')
                            collectionOtherParent.removeClass('opacity')
                        }
                        // 显示节点信息
                        showNodeInfo(this)
                    } else {
                        collectionEdge.removeClass('highlight-edge')
                        collectionParent.removeClass('highlight-node-sec')
                        collectionEdge.addClass('opacity')
                        collectionParent.addClass('opacity')
                        for(let obj of collectionEdge) {
                            let collectionOtherNode = null
                            let collectionOtherParent = null
                            if(obj.data('source') !== evt.target.data('id')) {
                                collectionOtherNode = cy2.filter(function(element, i){
                                    return element.isNode() && (element.data('id') === obj.data('source') );
                                });
                                
                            } else if(obj.data('target') !== evt.target.data('id')) {
                                collectionOtherNode = cy2.filter(function(element, i){
                                    return element.isNode() && (element.data('id') === obj.data('target') );
                                });
                            }
                            collectionOtherParent = cy2.filter(function(element, i){
                                return element.isNode() && (element.data('id') === collectionOtherNode[0].data('parent') );
                            });
                            collectionOtherParent.removeClass('highlight-node-sec')
                            collectionOtherNode.removeClass('highlight-node-sec')
                            collectionOtherNode.addClass('opacity')
                            collectionOtherParent.addClass('opacity')
                        }
                        let collectionNodes = cy2.filter(function(element, i){
                            return element.isNode() && (element.classes().indexOf('highlight-node') !== -1);
                        })
                        for(let node of collectionNodes) {
                                collectionEdge = cy2.filter(function(element, i){
                                    return element.isEdge() &&(element.data('source') === node.data('id') || element.data('target') === node.data('id'));
                                });
                                collectionEdge.addClass('highlight-edge')
                                for(let obj of collectionEdge) {
                                    let collectionOtherNode = null
                                    let collectionOtherParent = null
                                    if(obj.data('source') !== evt.target.data('id')) {
                                        collectionOtherNode = cy2.filter(function(element, i){
                                            return element.isNode() && (element.data('id') === obj.data('source') );
                                        });
                                        
                                    } else if(obj.data('target') !== evt.target.data('id')) {
                                        collectionOtherNode = cy2.filter(function(element, i){
                                            return element.isNode() && (element.data('id') === obj.data('target') );
                                        });
                                    }
                                    collectionOtherParent = cy2.filter(function(element, i){
                                        
                                        return element.isNode() && (element.data('id') === collectionOtherNode[0].data('parent') );
                                    });
                                    collectionOtherParent.addClass('highlight-node-sec')
                                    collectionOtherNode.addClass('highlight-node-sec')
                                    collectionOtherNode.removeClass('opacity')
                                    collectionOtherParent.removeClass('opacity')
                            }
                        }
                        document.getElementById('my-node-info__panel-label').innerHTML = 'Click one node for more information.↑'
                    }
                    // 判断一下目前选中了几个点
                    let noSelectedNodes = cy2.filter(function(element, i){
                        return element.isNode() && element.classes().indexOf('highlight-node') === -1 && element.classes().indexOf('highlight-node-sec') === -1 ;
                    });
                    let noSelecteEdges = cy2.filter(function(element, i){
                        return element.isEdge() && element.classes().indexOf('highlight-edge') === -1 ;
                    });
                    noSelectedNodes.addClass('opacity')
                    noSelecteEdges.addClass('opacity')
        
                    // 如果没有节点被选中，就还原
                    let selectedNodes = cy2.filter(function(element, i){
                        return element.isNode() && (element.classes().indexOf('highlight-node') !== -1 );
                    });
                    if(selectedNodes.length === 0) {
                        // 清除所有样式
                        cy2.nodes().style('display', 'element')
                        cy2.nodes().removeClass('opacity')
                        cy2.edges().removeClass('opacity')
                        cy2.nodes().removeClass('highlight-node')
                        cy2.nodes().removeClass('highlight-node-sec')
                        cy2.edges().removeClass('highlight-edge')
                    }   
                }
                
            })
        }
        tapNodes()

        function showNodeInfo(_this) {
            let id = _this.data('id')
            for(let key in raw_data) {
                for(let key2 in raw_data[key]) {
                    if(key2 === id) {
                        let obj = raw_data[key][id]
                        let newStr = String(JSON.stringify(obj)).replace("{", "")
                        let newStr2 = newStr.replace("}", "")
                        let arr = newStr2.split(',')
                        document.getElementById('my-node-info__panel-label').innerHTML = `<h5 class="my-node-info__title">` + _this.data('label')+  `</h5>`
                        for(let index in arr) {
                            document.getElementById('my-node-info__panel-label').innerHTML += `<label class="my-node-info__item">` + arr[index] + `</label>`
                        }
                    }
                }
            }
        }

        /* 线合并切换按钮样式 */
        var simpleModeBtn = document.getElementById('my-simple-mode')
        var complicateModeBtn = document.getElementById('my-complicate-mode')
        var modeBtn = document.getElementById('my-mode-change__btn')
        var modeBtnLabel = document.getElementById('my-mode-change__label')
        var simpleMode = true
        simpleModeBtn.addEventListener('click', showSimpleLine)
        complicateModeBtn.addEventListener('click', showComplicateLine)
        modeBtn.addEventListener('click', function() {
            if(simpleMode) {
                showComplicateLine()
                simpleMode = false
            } else {
                showSimpleLine()
                simpleMode= true
            }
        })
        function showComplicateLine() {
            document.getElementById('my-complicate-mode__tag').style.display = 'block'
            document.getElementById('my-simple-mode__tag').style.display = 'none'
            document.getElementById('my-menu-sec').style.display = 'none'
            modeBtnLabel.innerHTML = 'Complicated mode'
            for(let obj of cy2.edges()) {
                if(!obj.data().isMerge) {
                    obj.style('display', 'element')
                } else {
                    obj.style('display', 'none')
                }
            }
        }
        function showSimpleLine() {
            document.getElementById('my-complicate-mode__tag').style.display = 'none'
            document.getElementById('my-simple-mode__tag').style.display = 'block'
            document.getElementById('my-menu-sec').style.display = 'none'
            modeBtnLabel.innerHTML = 'Simple mode'
            for(let edge of cy2.edges()) {
                let sourceId = edge.data().source
                let targetId = edge.data().target

                let collection = cy2.filter(function(element, i){
                    return element.isEdge() &&(element.data('source') === sourceId && element.data('target') === targetId);
                });
    
                if(collection.length > 1) {
                    for(let obj of collection) {
                        if(!obj.data().isMerge) {
                            obj.style('display', 'none')
                        } else {
                            obj.style('display', 'element')
                        }
                    }
                }
            }
        }

        /* 显示名字-功能 */
        var showNamesCheck = document.getElementById('my-show-names__check')
        var showNamesCheckState = true
        var showNamesTag = document.getElementById('my-show-name__tag')
        showNamesCheck.addEventListener('click', showNameFunc)
        function showNameFunc() {
            if(showNamesCheckState) {
                cy2.nodes().addClass('hide-name');
                cy2.edges().addClass('hide-name');
                showNamesTag.style.display = 'none'
                showNamesCheckState = false
            } else {
                cy2.nodes().removeClass('hide-name');
                cy2.edges().removeClass('hide-name');
                showNamesTag.style.display = 'block'
                showNamesCheckState = true
            }
        }

        /* 重置 */
        var restartBtn = document.getElementById('restart')
        restartBtn.addEventListener('click', function() {
            //清空类型选项
            cateTypeList = []
            new_elements_nodes = []
            new_elements_edges = []
            sortByNameState = false
            sortByFreqState = false
            document.getElementById('my-sortbyname__btn').style.backgroundColor = '#fff'
            document.getElementById('my-sortbyfreq__btn').style.backgroundColor = '#fff'
            
            for (let i=0; i < cateBtns.length; i++) {
                cateBtns[i].classList.remove('cate-btn__active')   
            }
            // 清除所有样式
            cy2.nodes().style('display', 'element')
            cy2.nodes().removeClass('opacity')
            cy2.edges().removeClass('opacity')
            cy2.nodes().removeClass('highlight-node')
            cy2.nodes().removeClass('highlight-node-sec')
            cy2.edges().removeClass('highlight-edge')

            document.getElementById('my-node-info__panel-label').innerHTML = 'Click one node for more information.↑'
            
            //重新布局
            // cy2.layout({
            //     name: 'dagre',
            //   }, {
            //     rankDir: 'TB',
            //     ranker: 'network-simplex'
            //   }).run()
            
            // 更新竖栏节点
            updateNodesColunm(elements.nodes)
        })

        var menuMode = document.getElementById('my-menu-mode')
        var menuSec = document.getElementById('my-menu-sec')
        menuMode.addEventListener('mouseover', function() {
            menuSec.style.display = 'block'
        })
        menuMode.addEventListener('mouseout', function() {
            menuSec.style.display = 'none'
        })
        menuSec.addEventListener('mouseover', function() {
            menuSec.style.display = 'block'
        })
        menuSec.addEventListener('mouseout', function() {
            menuSec.style.display = 'none'
        })

        /* 显示隐藏节点信息框 */
        var closeNodeInfoBtn = document.getElementById('my-close-info-panel__btn')
        var nodeInfoPanel = document.getElementById('my-node-info__panel')
        closeNodeInfoBtn.addEventListener('click', function(evt) {
            nodeInfoPanel.classList.add('panel-hide')
        })
        var showPanelBtn = document.getElementById('my-show-panel__btn')
        showPanelBtn.addEventListener('click', function(evt) {
            nodeInfoPanel.classList.remove('panel-hide')
        })
        var closeNodeListBtn = document.getElementById('my-close-node-list__btn')
        var nodeListPanel = document.getElementById('my-node-list-panel')
        closeNodeListBtn.addEventListener('click', function(evt) {
            nodeListPanel.classList.add('panel-hide')
            document.getElementsByClassName('cy-panzoom-zoom-only')[0].style.left = '0px'
            document.getElementById('my-node-info__panel').style.left = '15px'
        })
        var showListPanelBtn = document.getElementById('my-show-list-panel__btn')
        showListPanelBtn.addEventListener('click', function(evt) {
            nodeListPanel.classList.remove('panel-hide')
            document.getElementsByClassName('cy-panzoom-zoom-only')[0].style.left = '220px'
            document.getElementById('my-node-info__panel').style.left = '240px'
        })

        /* 上传文件 */
        
        document.getElementById('my-import-file__btn').addEventListener('click', importJsonFile)
        function importJsonFile(){
            var objFile = document.getElementById("fileId")
            // console.log(objFile.files[0].size); // 文件字节数
            var files = $('#fileId').prop('files') //获取到文件列表
            var fileValue = objFile.value
            var typeAllow = ["json"]
            var fileType = (fileValue.substring(fileValue.lastIndexOf(".")+1,fileValue.length)).toLowerCase()
            if (objFile.value == "" || objFile.value == null) {
                alert("请传入json文件")
            } else if (files.length == 0) {
                alert('请选择文件');
            } else if($.inArray(fileType, typeAllow) < 0) { 
                alert("请传入正确的文件格式，以下为正确后缀: xxx.json")
            } else {
                var reader = new FileReader();//新建一个FileReader
                reader.readAsText(files[0], "UTF-8");//读取文件
                reader.onload = function (evt) { //读取完文件之后会回来这里
                    var fileString = evt.target.result; // 读取文件内容
                    raw_data = JSON.parse(fileString)
                    file_data = JSON.stringify(raw_data, null, "\t")
                    fileName = files[0].name
                    elements.nodes = loadNodesData(raw_data)
                    elements.edges = loadEdgesData(raw_data)
                    othersType = othersTypeFunc(raw_data)
                    // console.log(raw_data, 'raw_data')
                    cy2 = cytoscape({
                        container: document.getElementById('my-graph-canvas__pattern2'),
                        boxSelectionEnabled: false,
                        autounselectify: true,
                        layout: {name: 'dagre'},
                        style: dataArray[0],
                        elements: elements
                    });
                    cy2.panzoom( panZoomDefaults );
                    
                    cy2.viewport({
                        zoom: 0.1,
                        pan: { x: 350, y: 60 }
                      });
                    updateNodesColunm(elements.nodes)
                    drawBoldEdges()
                    tapEdges()
                    cxttapNodes()
                    tapNodes()
                    
                }
            }
        }

        document.getElementById('my-export-json__btn').addEventListener('click', function() {
            if('download' in document.createElement('a')) {
				funDownload(file_data, fileName);
			} else {
				alert('浏览器不支持');
			}
        })
        // 下载文件方法
        var funDownload = function(content, filename) {
            var eleLink = document.createElement('a');
            eleLink.download = filename;
            eleLink.style.display = 'none';
            // 字符内容转变成blob地址
            var blob = new Blob([content]);
            eleLink.href = URL.createObjectURL(blob);
            // 触发点击
            document.body.appendChild(eleLink);
            eleLink.click();
            // 然后移除
            document.body.removeChild(eleLink);
        }
})


