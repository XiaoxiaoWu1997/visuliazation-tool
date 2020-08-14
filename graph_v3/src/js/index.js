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
        var elements = {}
        elements.nodes = []
        elements.edges = []

        for(let id in raw_data['agent']) {
            let category = 'agent'
            let obj = {}
            obj.group = 'nodes'
            obj.data = {}
            obj.data.id = id
            obj.data.label = raw_data['agent'][id]['prov:label']?raw_data['agent'][id]['prov:label']:raw_data['agent'][id]['prov:type']+ '  ' + raw_data['agent'][id]['cf:id']
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
            } else {
                obj.data.shapeType = 'vee'
                obj.data.type = raw_data[category][id]['prov:type']
            }
        
            elements.nodes.push(obj)
        }
        for(let id in raw_data['activity']) {
            let category = 'activity'
            let obj = {}
            obj.group = 'nodes'
            obj.data = {}
            obj.data.id = id
            obj.data.freq = calculateNodeFreq(id)
            obj.data.label = raw_data['activity'][id]['prov:label']+ '  ' + raw_data['activity'][id]['cf:id']
            obj.classes = 'center-right'
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
            } else {
                obj.data.shapeType = 'vee'
                obj.data.type = raw_data[category][id]['prov:type']
            }
        
            elements.nodes.push(obj)
        }
        for(let id in raw_data['entity']) {
            let category = 'entity'
            let obj = {}
            obj.group = 'nodes'
            obj.data = {}
            obj.data.id = id
            obj.data.freq = calculateNodeFreq(id)
            obj.data.label = raw_data['entity'][id]['prov:label']+ '  ' + raw_data['entity'][id]['cf:id']
            obj.classes = 'center-right'
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
            } else {
                obj.data.shapeType = 'vee'
                obj.data.type = raw_data[category][id]['prov:type']
            }
        
            elements.nodes.push(obj)
        }

        // 工具函数：根据id找到节点类型
        function findNodeType(id) {
            for(let key in raw_data) {
               if (raw_data[key][id]) {
                    return raw_data[key][id]['prov:type']
               }
            }
        }

        // 工具函数：计算节点频率 注意
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

        var cy = window.cy = cytoscape({
            container: document.getElementById('my-graph-canvas'),
            boxSelectionEnabled: false,
            autounselectify: true,
            layout: {name: 'dagre'},
            style: dataArray[0],
            elements: elements
        });

        // 放大缩小
        var panZoomDefaults = {
            zoomFactor: 0.05, // zoom factor per zoom tick
            zoomDelay: 45, // how many ms between zoom ticks
            minZoom: 0.1, // min zoom level
            maxZoom: 10, // max zoom level
            fitPadding: 50, // padding when fitting
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

        // add the panzoom control
        cy.panzoom( panZoomDefaults );

        // 与节点的交互
        cy.on('tap', 'node', showNodeInfo);

        function showNodeInfo() {
            let id = this.data('id')
            for(let key in raw_data) {
                for(let key2 in raw_data[key]) {
                    if(key2 === id) {
                        let obj = raw_data[key][id]
                        let newStr = String(JSON.stringify(obj)).replace("{", "")
                        let newStr2 = newStr.replace("}", "")
                        let arr = newStr2.split(',')
                        document.getElementById('my-node-info__panel').innerHTML = `<h5 class="my-node-info__title">` +this.data('label')+  `</h5>`
                        for(let index in arr) {
                            document.getElementById('my-node-info__panel').innerHTML += `<label class="my-node-info__item">` + arr[index] + `</label>`
                        }
                    }
                }
            }
        }

        // console.log(elements, 'elements')
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

        // 工具函数: 删除数组中的指定元素
        function removeArrElem(arr, val) {
            if(val === 'others') {
                arr.splice(arr.indexOf('machine'), 1);
                // arr.splice(arr.indexOf('file'), 1);
            } else {
                let index = arr.indexOf(val);
                if (index > -1) {
                    arr.splice(index, 1);
                }
            }
            return arr
        };

        // 提前把所有节点类型弄出来
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

        // 更新数据
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
        // 类型按钮交互
        var cateBtns = document.getElementsByClassName('my-node-category__btn')
        for (let i=0; i < cateBtns.length; i++) {
            cateBtns[i].addEventListener('click', selectCateBtn, true)     
        }
        let cateTypeList = []
        function selectCateBtn(e) {
            if(e.target.getAttribute('class').indexOf('cate-btn__active') < 0) {
                e.currentTarget.classList.add('cate-btn__active')
                // 防止点击两次 把选择的选项push到选项数组
                if(cateTypeList.indexOf(e.currentTarget.id) < 0 ) {
                    if(e.currentTarget.id === 'others') {
                        //暂时放置 ”machine“ ”file“
                        if(cateTypeList.indexOf('machine') < 0) {
                            cateTypeList.push('machine')
                            // cateTypeList.push('file')
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

         // 更新视图
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
                return eval('element.isNode() &&(' + filterNodesStr + ')');
              });

            for(let obj of collection) {
                obj.style('display', 'element')
            }
        }

        updateNodesColunm(elements.nodes)
        // 更新节点栏
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
                if(key !== String(new_elements_nodes.length-1)) {
                    nodeDiv.innerHTML +=
                    ` <div class="custom-control custom-checkbox my-check-box">
                        <input type="checkbox" checked class="custom-control-input my-check-input" value="` + new_elements_nodes[key].data.id + `" name="my-check-node" id="check-input-`+ key +`">
                        <label class="custom-control-label" for="check-input-`+ key +`">`+ new_elements_nodes[key].data.label + ` (Freq:` +new_elements_nodes[key].data.freq +`)</label>
                    </div>`
                } else {
                    nodeDiv.innerHTML +=
                    ` <div class="custom-control custom-checkbox my-check-box">
                        <input type="checkbox" checked class="custom-control-input my-check-input" value="` + new_elements_nodes[key].data.id + `" name="my-check-node" id="check-input-`+ key +`">
                        <label class="custom-control-label" for="check-input-`+ key +`">`+ new_elements_nodes[key].data.label + ` (Freq:` +new_elements_nodes[key].data.freq +`)</label>
                    </div><div style="height:120px"></div>`
                }
                myNodeListBox.appendChild(nodeDiv)
            }
            // 给节点绑定事件
            var myCheckInputs = document.getElementsByName('my-check-node')
            
            for(let index = 0; index < myCheckInputs.length; index++) {
                myCheckInputs[index].addEventListener('click', selectCheckInput)
            }
        }
        // 首字母排序
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

          // 首字母排序
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


        // 多选节点筛选
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

        // 更新节点的筛选结果-返回数据
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

        // 画粗边
        let recordST = []
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

        cy2.on('tap', 'edge', function(evt) {
            
            let sourceId = evt.target.data().source
            let targetId = evt.target.data().target
            // let type = evt.target.data().type
            // let sourceType = evt.target.data().sourceType
            // let targetType = evt.target.data().targetType
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
})


