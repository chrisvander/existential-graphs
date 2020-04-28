(this["webpackJsonpexistential-graphs"]=this["webpackJsonpexistential-graphs"]||[]).push([[0],{12:function(e){e.exports=JSON.parse('{"binary":{"<->":"\\\\leftrightarrow","%":"\\\\leftrightarrow","->":"\\\\rightarrow","$":"\\\\rightarrow","&":"\\\\land","|":"\\\\lor"},"unary":{"~":"\\\\lnot","!":"\\\\lnot"},"eg":{"<->":"($1($2))(($1)$2)","%":"($1($2))(($1)$2)","->":"(($1)$2)","$":"(($1)$2)","&":"$1$2","|":"(($1)($2))"}}')},23:function(e,t,n){e.exports=n(64)},28:function(e,t,n){},29:function(e,t,n){},33:function(e,t,n){},62:function(e,t,n){},63:function(e,t,n){},64:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),i=n(10),s=n.n(i),o=(n(28),n(3)),c=n(4),l=n(1),u=n(6),h=n(5),d=(n(29),n(12)),v=d.binary,p=d.unary;function f(e){return"(?:"+(e=e.map((function(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}))).join("|")+")"}var g=f(Object.keys(p)),m="^(".concat(g,"*[A-Za-z]+|").concat(g,"*\\((.*)\\))(").concat(f(Object.keys(v)),")(").concat(g,"*[A-Za-z]+|").concat(g,"*\\((.*)\\))$"),b=new RegExp(m),y=new RegExp("^".concat(g,"*[A-Za-z]+$")),E=new RegExp("^".concat(g,"*\\((.*)\\)$"));var S=function(e){return function e(t){var n;return!!t.match(y)||(null!==(n=b.exec(t))?null!=n&&(n[2]&&n[5]?e(n[2])&&e(n[5]):n[2]?e(n[2]):!n[5]||e(n[5])):null!==(n=E.exec(t))?e(n[1]):void 0)}(e=e.replace(/\s/g,""))},k=n(12);function C(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}var w=k.binary,O=Object.keys(w);O=O.map((function(e){return C(e)}));var j=new RegExp("(?:"+O.join("|")+")","g"),x=k.unary;function N(e){var t=function(e){return function(t){return t===e}},n=0;for(n in e.split(""))if(!Object.keys(x).some(t(e.charAt(n))))break;return n}var P=function(e,t){null==t&&(t=!0);var n=N(e),a=e.substr(n);return a=t?D(a):"{"+a+"}","(".repeat(n)+a+")".repeat(n)},D=function e(t){if(("string"===typeof t||t instanceof String)&&S(t)){t=t.replace(/\s/g,"");var n=b.exec(t),a=E.exec(t),r=y.exec(t);if(n){var i=e(n[1]),s=e(n[4]);return k.eg[n[3]].replace(/\$1/g,i).replace(/\$2/g,s)}return a?0!=N(t)?P(t):e(a[1]):r?P(t,!1):null}return null},z=function(e,t){for(var n=0,a=t;a<e.length;){if("("===e[a])n++;else if(")"===e[a]&&0===--n)return a;a++}},$=function(e){Object(u.a)(n,e);var t=Object(h.a)(n);function n(e){var a;return Object(o.a)(this,n),(a=t.call(this,e)).state={functions:[{str:"Iterate/Deiterate",func:"iterate",highlight:{cut:"all",var:"all"}},{str:"Remove Double Cut",func:"dcRemove",highlight:{cut:"all"}},{str:"Add Double Cut",func:"dcAdd",highlight:{cut:"all",var:"all"}},{str:"Insertion",func:"insert",highlight:{cut:"odd",var:"odd"}},{str:"Erasure",func:"erase",highlight:{cut:"even",var:"even"}}]},a}return Object(c.a)(n,[{key:"componentDidMount",value:function(){}},{key:"render",value:function(){var e=this;return this.props.hidden?r.a.createElement(r.a.Fragment,null):r.a.createElement("div",{className:"toolbox",ref:this.canvas},r.a.createElement("h3",null,"Tools"),this.state.functions.map((function(t){return r.a.createElement("div",{className:"tool",onClick:function(){return e.props.setSelection(t.highlight,t.func)}},t.str)})))}}]),n}(r.a.Component),I=n(7),R=function(e){Object(u.a)(n,e);var t=Object(h.a)(n);function n(){return Object(o.a)(this,n),t.apply(this,arguments)}return Object(c.a)(n,[{key:"handleClick",value:function(e,t,n){e.preventDefault(),n||this.props.setStep(t)}},{key:"getColor",value:function(e){return e?"rgb(136, 136, 136)":"rgb(68, 68, 68)"}},{key:"render",value:function(){var e=this,t=this.props,n=t.hide,a=t.currentStep,i=t.stepInfo;if(n)return r.a.createElement(r.a.Fragment,null);var s=a===i.length-1,o=0===a;return r.a.createElement(r.a.Fragment,null,r.a.createElement("div",{className:"step-menu"},r.a.createElement("div",{style:{color:this.getColor(o)}},r.a.createElement("div",{onClick:function(t){return e.handleClick(t,0,o)}},r.a.createElement(I.a,{src:"/existential-graphs/assets/step-first.svg"})),r.a.createElement("div",{onClick:function(t){return e.handleClick(t,a-1,o)}},r.a.createElement(I.a,{src:"/existential-graphs/assets/step-prev.svg"}))),r.a.createElement("div",{style:{color:this.getColor(s)}},r.a.createElement("div",{onClick:function(t){return e.handleClick(t,a+1,s)}},r.a.createElement(I.a,{src:"/existential-graphs/assets/step-next.svg"})),r.a.createElement("div",{onClick:function(t){return e.handleClick(t,i.length-1,s)}},r.a.createElement(I.a,{src:"/existential-graphs/assets/step-last.svg"})))),r.a.createElement("div",{className:"step-text"},"Step ",a+1," of ",i.length))}}]),n}(r.a.Component),A={gridSize:1,cutPadding:{horizontal:10,vertical:5},cutCornerRadius:10,initialSeparation:50},M=function(e){Object(u.a)(n,e);var t=Object(h.a)(n);function n(e){var a;return Object(o.a)(this,n),(a=t.call(this,e)).text=r.a.createRef(),a.getCoords=a.props.getCoords,a.handleClick=a.handleClick.bind(Object(l.a)(a)),a.state={x:e.x,y:e.y,cursorOver:!1,dragging:!1},a.panzoom=a.props.panzoom,window.addEventListener("mousemove",a.onMouseMove.bind(Object(l.a)(a))),window.addEventListener("mousedown",a.handleDragStart.bind(Object(l.a)(a))),window.addEventListener("mouseup",a.handleDragEnd.bind(Object(l.a)(a))),window.addEventListener("click",a.handleClick),a}return Object(c.a)(n,[{key:"handleClick",value:function(){this.state.cursorOver&&this.props.enableHighlight&&this.props.selectedCallback&&(this.props.selectedCallback(this.props.id),this.setState({cursorOver:!1}))}},{key:"componentDidMount",value:function(){this.text.current.style.cursor="pointer"}},{key:"handleDragStart",value:function(e){this.state.cursorOver&&(this.panzoom.pause(),this.setState({dragging:!0}))}},{key:"handleDragEnd",value:function(e){this.panzoom.resume();var t=this.state,n=t.x,a=t.y;this.props.setCoords(n,a),this.setState({dragging:!1})}},{key:"onMouseMove",value:function(e){if(this.state.dragging){var t=this.getCoords(e.clientX,e.clientY),n=t.x,a=t.y;n=Math.round(n/A.gridSize)*A.gridSize,a=Math.round(a/A.gridSize)*A.gridSize,this.props.setCoords(n,a),this.setState({x:n,y:a})}}},{key:"componentWillUnmount",value:function(){window.removeEventListener("click",this.handleClick),window.removeEventListener("mousemove",this.onMouseMove.bind(this)),window.removeEventListener("mousedown",this.handleDragStart.bind(this)),window.removeEventListener("mouseup",this.handleDragEnd.bind(this))}},{key:"render",value:function(){var e=this,t=this.state.cursorOver&&this.props.enableHighlight;return r.a.createElement("text",{className:"noselect",pointerEvents:this.props.interaction?null:"none",x:this.state.x,y:this.state.y,id:this.props.id,fill:t?"blue":"black",onMouseEnter:function(){return e.setState({cursorOver:!0})},onMouseLeave:function(){return e.setState({cursorOver:!1})},ref:this.text},this.props.children)}}]),n}(r.a.Component),L=function(e){Object(u.a)(n,e);var t=Object(h.a)(n);function n(e){var a;return Object(o.a)(this,n),(a=t.call(this,e)).cut=r.a.createRef(),a.BB=r.a.createRef(),a.getBBoxData=a.getBBoxData.bind(Object(l.a)(a)),a.handleClick=a.handleClick.bind(Object(l.a)(a)),a.update=a.update.bind(Object(l.a)(a)),a.state={highlight:!1,bounding:{_x:0,_y:0,_w:0,_h:0}},window.addEventListener("click",a.handleClick),a}return Object(c.a)(n,[{key:"handleClick",value:function(){this.state.highlight&&this.props.enableHighlight&&this.props.selectedCallback&&(this.props.selectedCallback(this.props.id),this.setState({highlight:!1}))}},{key:"getBBoxData",value:function(){if(this.cut.current){var e=this.cut.current.getBBox(),t=e.x,n=e.y,a=e.width,r=e.height;return{_x:t-A.cutPadding.horizontal,_y:n-A.cutPadding.vertical,_w:a+2*A.cutPadding.horizontal,_h:r+2*A.cutPadding.vertical}}return{}}},{key:"update",value:function(){var e=this;this.interval||(this.interval=setInterval((function(){e.setState({bounding:e.getBBoxData()})}),1),setTimeout((function(){clearInterval(e.interval),e.interval=null}),100))}},{key:"componentDidMount",value:function(){this.update()}},{key:"componentDidUpdate",value:function(){this.update()}},{key:"componentWillUnmount",value:function(){window.removeEventListener("click",this.handleClick),this.interval&&clearInterval(this.interval)}},{key:"render",value:function(){var e=this,t=this.props.children;t.length<1&&(t=r.a.createElement(n,null," "));var a=this.state.highlight&&this.props.enableHighlight,i=this.state.bounding,s=i._x,o=i._y,c=i._w,l=i._h;return r.a.createElement(r.a.Fragment,null,r.a.createElement("rect",{x:s,y:o,width:c,height:l,fillOpacity:"0.7",strokeOpacity:"1",stroke:"black",fill:a?"#9AA899":"white",onMouseEnter:function(){return e.setState({highlight:!0})},onMouseLeave:function(){return e.setState({highlight:!1})},rx:A.cutCornerRadius.toString(),ry:A.cutCornerRadius.toString()}),r.a.createElement("g",{ref:this.cut},this.props.children))}}]),n}(r.a.Component),B=(n(33),n(22)),F=n.n(B),T=(n(44),n(59).nanoid);var W=function(e){Object(u.a)(n,e);var t=Object(h.a)(n);function n(e){var a;Object(o.a)(this,n),(a=t.call(this,e)).canvas=r.a.createRef(),a.canvasContainer=r.a.createRef(),a.renderStep=a.renderStep.bind(Object(l.a)(a)),a.changePos=a.changePos.bind(Object(l.a)(a)),a.getSVGCoords=a.getSVGCoords.bind(Object(l.a)(a)),a.highlightCut=a.highlightCut.bind(Object(l.a)(a)),a.startSelection=a.startSelection.bind(Object(l.a)(a));var i=a.props.proof,s=i.premises,c=i.conclusion,u=i.steps,h=i.data;return a.state={proof:{premises:s,conclusion:c},steps:u||[],data:h||{},currentStep:0,moveListeners:[],highlights:{cut:"none",var:"none"},cbFunction:null,interaction:!0,functions:{insert:function(e){console.log("INSERTION")},erase:function(e){return console.log("ERASURE"),a.erasure(e)},iterate:function(e){return console.log("ITERATION"),a.iteration(e,a.state.steps[a.state.currentStep].data[0].id)},dcRemove:function(e){return console.log("DOUBLE CUT Remove"),a.doubleCutRemove(e)},dcAdd:function(e){return console.log("DOUBLE CUT Add"),a.doubleCutAdd(e)}}},a}return Object(c.a)(n,[{key:"startSelection",value:function(e,t){var n=this,a=this.state,r=a.steps;a.currentStep+1===r.length&&this.setState({highlights:e,interaction:!1,cbFunction:function(e){n.state.functions[t](e)&&n.setState({highlights:{cut:"none",var:"none"},interaction:!0,cbFunction:null})}})}},{key:"iteration",value:function(e,t){var n=this.state,a=n.steps,r=n.currentStep,i=n.data,s=this.copyStep(a[r]);if(!this.isInNestedGraph(s,t,e))return console.log("Insert selection is not in a subgraph of Copy selection"),!1;var o=this.copyContents(this.findID(s,e));if(!o)return console.log("Copy ID could not be found in Iterate"),!1;var c=this.findID(s,t);return c?(c.data=c.data.concat(o),this.changeCutLevel(s,o.id,i[c.id].level+1),r+=1,a.push(s),this.setState({steps:a,currentStep:r,data:i}),!0):(console.log("Insert ID could not be found in Iterate"),!1)}},{key:"erasure",value:function(e){var t=this.state,n=t.steps,a=t.currentStep,r=t.data,i=this.copyStep(n[a]),s=this.findID(i,e);if(!s)return!1;var o=this.findParent(i,e);if(!o)return!1;var c=o.data.indexOf(s);return c>-1&&(o.data.splice(c,1),a+=1,n.push(i),this.setState({steps:n,currentStep:a,data:r}),!0)}},{key:"doubleCutAdd",value:function(e){var t=this.state,n=t.steps,a=t.currentStep,r=t.data,i=this.copyStep(n[a]),s=this.findID(i,e);if(!s)return!1;var o=T(),c=T(),l={data:[{data:[s],id:c,type:"cut"}],id:o,type:"cut"},u=r[e].level;r[c]={type:"cut",level:u+1},r[o]={type:"cut",level:u},this.changeCutLevel(i,e,2);var h=this.findParent(i,e);if(!h)return!1;var d=h.data.indexOf(s);return d>-1&&h.data.splice(d,1),h.data=h.data.concat(l),a+=1,n.push(i),this.setState({steps:n,currentStep:a,data:r}),!0}},{key:"doubleCutRemove",value:function(e){var t=this.state,n=t.steps,a=t.currentStep,r=t.data,i=this.copyStep(n[a]),s=this.findID(i,e);if(s&&"cut"===s.type){var o=s.data;if(o&&1===o.length&&"cut"===o[0].type){var c=o[0].data,l=this.findParent(i,e);if(!l)return!1;this.changeCutLevel(i,o[0].id,-2);var u=l.data.indexOf(s);return u>-1&&l.data.splice(u,1),l.data=l.data.concat(c),a+=1,n.push(i),this.setState({steps:n,currentStep:a,data:r}),!0}return!1}return!1}},{key:"isInNestedGraph",value:function(e,t,n){var a=this.findParent(e,n);return a?!!this.findID(a,t)||(console.log("Child is not in nested graph of Parent"),!1):(console.log("Parent Data could not be found"),!1)}},{key:"copyContents",value:function(e){var t=this.state.data;function n(e,n){var r={};for(var i in e)if("id"===i){var s=T();r[i]=s,t[s]={type:"cut",level:n}}else r[i]="data"!==i?e[i]:a(e[i],n+1);return r}function a(e,a){var r=[];for(var i in e)if("string"===typeof e[i]){var s=T();r.push(s),t[s]={type:"var",var:t[e[i]].var,x:t[e[i]].x,y:t[e[i]].y}}else r.push(n(e[i],a));return r}var r=n(e,0);return this.setState({data:t}),r}},{key:"changeCutLevel",value:function(e,t,n){var a=this.state.data;if("var"!==a[t].type){var r=!1;s(e.data),this.setState({data:a})}else a[t].level+=n;function i(e){var i;e.id&&(i=e.id)===t&&(r=!0),r&&(a[i].level+=n),e.data&&s(e.data)}function s(e){for(var t in e)"string"!==typeof e[t]?i(e[t]):r&&(a[e[t]].level+=n)}}},{key:"copyStep",value:function(e){var t={};function n(e){var t={};for(var n in e)"string"===typeof e[n]?t[n]=e[n]:t[n]=a(e[n]);return t}function a(e){var t=[];for(var a in e)"string"===typeof e[a]?t.push(e[a]):t.push(n(e[a]));return t}return t.data=a(e.data),t.h=e.h,t.w=e.w,t}},{key:"findParent",value:function(e,t){var n=e;function a(e){for(var n in e)if("string"===typeof e[n]){if(e[n]===t)return!0}else{if(e[n].id&&e[n].id===t)return!0;r(e[n])}return!1}function r(e){e.data&&a(e.data)&&(n=e)}return a(e.data),n}},{key:"findID",value:function(e,t){function n(e){for(var n in e)if("string"===typeof e[n]){if(e[n]===t)return t}else{if(e[n].id===t)return e[n];var r=a(e[n]);if(r)return r}}function a(e){for(var a in e){if(e[a]instanceof Array)return n(e[a]);if("id"===a&&e[a]===t)return e}}return a(e)}},{key:"changePos",value:function(e,t,n){var a=this.state.data;Object.assign(a[e],{x:t,y:n}),this.setState(a)}},{key:"highlightCut",value:function(e){if("all"===this.state.highlights.cut)return!0;var t=!1;return e%2===1&&(t=!0),!("odd"!==this.state.highlights.cut||!t)||"even"===this.state.highlights.cut&&!t}},{key:"highlightVar",value:function(e){if("all"===this.state.highlights.var)return!0;var t=!1;return e%2===1&&(t=!0),!("odd"!==this.state.highlights.var||!t)||"even"===this.state.highlights.var&&!t}},{key:"renderStep",value:function(e){var t=this,n=this.state.data,a=this.state.steps[e];if(a){var i=function e(a){var i=[],s=function(s){if("cut"===a[s].type){var o=n[a[s].id].level,c=r.a.createElement(L,{level:o,enableHighlight:t.highlightCut(o),id:a[s].id,selectedCallback:t.state.cbFunction},e(a[s].data));i.push(c)}else{var l=t.state.data[a[s]],u=n[a[s]].level;i.unshift(r.a.createElement(M,{x:l.x,y:l.y,id:a[s],enableHighlight:t.highlightVar(u),selectedCallback:t.state.cbFunction,panzoom:t.panzoom,interaction:t.state.interaction||t.highlightVar(u),getCoords:t.getSVGCoords,setCoords:function(e,r){return function(e,a,r){n[e].x=a,n[e].y=r,t.setState({data:n})}(a[s],e,r)},key:a[s]},l.var))}};for(var o in a)s(o);return i};return i.bind(this),i(a.data)}}},{key:"componentDidMount",value:function(){this.panzoom=F()(this.canvas.current,{maxZoom:6,minZoom:.5});var e=Math.max(document.documentElement.clientWidth,window.innerWidth||0),t=Math.max(document.documentElement.clientHeight,window.innerHeight||0),n=this.state.steps;if(0===n.length){var a=this.state.proof,r=a.premises,i=(a.conclusion,function(e,t){var n={},a=0,r=0,i=0;return{stepZero:{data:function e(t,s,o){for(var c in console.log(n),t)if(t[c]instanceof Array&&t[c].length>0){var l=T();t[c]={data:e(t[c],s+1),id:l,type:"cut"},n[l]={type:"cut",level:s}}else{var u=a,h=T();n[h]={type:"var",var:t[c],x:Math.round(u/A.gridSize)*A.gridSize,y:Math.round(0/A.gridSize)*A.gridSize,level:s},t[c]=h,i=0>i?0:i,r=u>r?u:r,a+=A.initialSeparation}return t}(e,t),h:i+22,w:r},data:n}}(function e(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;if("string"===typeof t||t instanceof String){for(var a=[];n<t.length;){if("("===t[n]){var r=z(t,n),i=t.substr(n+1,r-1);i&&a.push(e(t.substr(n+1,r-1))),n=r}else if("{"===t[n]){var s=t[++n];"}"===s?a.push("\xa0"):a.push(s),n++}n++}return a}return null}(r.join("")),0)),s=i.stepZero,o=i.data;n.push(s),this.setState({steps:n,data:o})}this.setState({currentStep:0});var c=this.state.steps[this.state.currentStep];this.panzoom.moveTo(e/2-c.w,t/2-c.h),this.panzoom.zoomTo(e/2-c.w,t/2-c.h,2)}},{key:"componentWillUnmount",value:function(){window.removeEventListener("resize",this)}},{key:"getSVGCoords",value:function(e,t){var n=this.canvasContainer.current.createSVGPoint();return n.x=e,n.y=t,n.matrixTransform(this.canvas.current.getScreenCTM().inverse())}},{key:"render",value:function(){var e=this,t=function(){},n=this.state,a=n.steps,i=n.currentStep;return this.panzoom&&(t=this.panzoom.zoomWithWheel),r.a.createElement("div",null,r.a.createElement($,{hidden:i+1!==a.length,functions:this.state.functions,setSelection:this.startSelection}),r.a.createElement("svg",{ref:this.canvasContainer,className:"canvas noselect",onWheel:t},r.a.createElement("g",{ref:this.canvas},this.panzoom&&this.renderStep(this.state.currentStep))),r.a.createElement(R,{currentStep:this.state.currentStep,stepInfo:this.state.steps,setStep:function(t){return e.setState({currentStep:t,interaction:t===e.state.steps.length-1})}}))}}]),n}(r.a.Component),V=(n(60),n(11)),_=n.n(V),G=(n(62),function(e){Object(u.a)(n,e);var t=Object(h.a)(n);function n(e){var a;return Object(o.a)(this,n),(a=t.call(this,e)).state={premises:[""],conclusion:""},a.handleChange.bind(Object(l.a)(a)),a.removePremise.bind(Object(l.a)(a)),a.verify=a.verify.bind(Object(l.a)(a)),a.create=a.create.bind(Object(l.a)(a)),a}return Object(c.a)(n,[{key:"componentDidMount",value:function(){}},{key:"handleChange",value:function(e,t){if(null!=t){var n=this.state.premises;n[t]=e.target.value,this.setState({premises:n})}else this.setState({conclusion:e.target.value})}},{key:"removePremise",value:function(e){var t=this.state.premises;t.splice(e,1),this.setState({premises:t})}},{key:"verify",value:function(){var e=this.state,t=e.premises,n=e.conclusion;for(var a in t)if(""===t[a]||!t[a])return!1;return!(""===n||!n)}},{key:"create",value:function(){if(console.log("Creating..."),console.log("Verification concluded "+this.verify()),this.verify()){var e=this.state,t=e.premises,n=e.conclusion;for(var a in t)t[a]=D(t[a]),console.log(t[a]);n=D(n),this.props.setupFunc(t,n,[])}}},{key:"getFormulaCell",value:function(e,t){var n,a,i=this;S(e)&&(n=function(e){if("string"===typeof e||e instanceof String){var t;for(e=e.replace(/\s/g,"");null!==(t=j.exec(e));)e=e.substr(0,t.index)+w[t[0]]+" "+e.substr(t.index+t[0].length);for(var n in Object.keys(x))t=Object.keys(x)[n],e=e.replace(new RegExp(C(t),"g"),x[t]+" ");return e=e.replace(/[^()A-Za-z\\\s]/g,"")}return""}(e),a=D(e));var s=r.a.createElement("td",{className:"close interactive",onClick:function(){return i.removePremise(t)}},"\u2715"),o=r.a.createElement("input",{onChange:function(e){return i.handleChange(e,t)}});return null==t&&(o=r.a.createElement("input",{onChange:function(e){return i.handleChange(e)}}),s=r.a.createElement("td",{className:"close"})),0===t&&(s=r.a.createElement("td",{className:"close"})),r.a.createElement("tr",null,r.a.createElement("td",null,o),r.a.createElement("td",null,n&&r.a.createElement(_.a,{math:n})),r.a.createElement("td",null,a&&r.a.createElement(_.a,{math:a})),s)}},{key:"render",value:function(){var e=this,t=this.state,n=t.premises,a=t.conclusion;return r.a.createElement("div",{className:"content full-width"},r.a.createElement("h1",null,"Create New"),r.a.createElement("h2",null,"File Name"),r.a.createElement("input",null),r.a.createElement("table",{className:"formulaTable"}),r.a.createElement("h2",null,"Premises"),r.a.createElement("table",{className:"formulaTable"},r.a.createElement("tr",null,r.a.createElement("td",null,"Formula"),r.a.createElement("td",null,"TeX notation"),r.a.createElement("td",null,"EG notation"),r.a.createElement("td",{className:"close"})),n.map((function(t,n){return e.getFormulaCell(t,n)})),r.a.createElement("tr",null,r.a.createElement("td",{className:"interactive",onClick:function(){return e.setState({premises:n.concat([""])})}},r.a.createElement("span",{className:"plus"}),"Add New Premise"),r.a.createElement("td",null),r.a.createElement("td",null),r.a.createElement("td",{className:"close"}))),r.a.createElement("h2",null,"Conclusion"),r.a.createElement("table",{className:"formulaTable"},this.getFormulaCell(a)))}}]),n}(r.a.Component)),U=(n(63),function(){return r.a.createElement("div",{className:"content"},r.a.createElement("div",{className:"column"},r.a.createElement("h1",null,"Existential Graphs"),r.a.createElement("p",null,"Using this tool, you can initialize proofs in the existential graph schema and then you can go through the process of solving them. You can save these proofs and look back at them later.")),r.a.createElement("div",{className:"divider"}),r.a.createElement("div",{className:"column"},r.a.createElement("h1",null,"Recent Proofs")))}),H=function(e){Object(u.a)(n,e);var t=Object(h.a)(n);function n(e){var a;return Object(o.a)(this,n),(a=t.call(this,e)).createView=r.a.createRef(),a.callCreate=a.callCreate.bind(Object(l.a)(a)),a.animateAway=a.animateAway.bind(Object(l.a)(a)),a.state={createShown:!1,floatingWindowCSS:"floating-window shown"},a}return Object(c.a)(n,[{key:"componentDidMount",value:function(){}},{key:"animateAway",value:function(){this.setState({floatingWindowCSS:"floating-window"})}},{key:"callCreate",value:function(){this.createView.current.create()}},{key:"render",value:function(){var e=this,t=this.state,n=t.createShown,a=t.floatingWindowCSS;return r.a.createElement("div",{className:a},!n&&r.a.createElement(U,null),n&&r.a.createElement(G,{setupFunc:this.props.setupFunc,ref:this.createView}),!n&&r.a.createElement("div",{className:"toolbar"},r.a.createElement("button",{onClick:function(){return e.setState({createShown:!0})}},"New"),r.a.createElement("button",null,"Open")),n&&r.a.createElement("div",{className:"toolbar"},r.a.createElement("button",{className:"back",onClick:function(){return e.setState({createShown:!1})}},r.a.createElement("span",null,r.a.createElement(I.a,{className:"svg",src:"/existential-graphs/assets/back-caret.svg"})),"Back"),r.a.createElement("button",{onClick:this.callCreate},"Create")))}}]),n}(r.a.Component),Z=function(e){Object(u.a)(n,e);var t=Object(h.a)(n);function n(e){var a;return Object(o.a)(this,n),(a=t.call(this,e)).createNewProof=a.createNewProof.bind(Object(l.a)(a)),a.setupProof=a.setupProof.bind(Object(l.a)(a)),a.openCanvas=a.openCanvas.bind(Object(l.a)(a)),a.saveProof=a.saveProof.bind(Object(l.a)(a)),a.introWindow=r.a.createRef(),a.state={initialCSS:"initial",canvasOpen:!1,popupOpen:!1,proof:{premises:[],conclusion:"",steps:[]}},a}return Object(c.a)(n,[{key:"saveProof",value:function(e){this.setState({proof:e})}},{key:"setupProof",value:function(e,t,n){this.setState({proof:{premises:e,conclusion:t,steps:n},initialCSS:"initial whiteBG"}),this.introWindow.current.animateAway(),setTimeout(this.openCanvas,1e3)}},{key:"openCanvas",value:function(){this.setState({canvasOpen:!0})}},{key:"createNewProof",value:function(){this.setState({popupOpen:!0})}},{key:"render",value:function(){return this.state.canvasOpen?r.a.createElement("div",{className:"App"},r.a.createElement(W,{saveProof:this.saveProof,proof:this.state.proof})):r.a.createElement("div",{className:this.state.initialCSS},r.a.createElement(H,{ref:this.introWindow,setupFunc:this.setupProof}))}}]),n}(r.a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));s.a.render(r.a.createElement(Z,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[23,1,2]]]);
//# sourceMappingURL=main.f79f5540.chunk.js.map