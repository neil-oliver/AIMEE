var app = new Vue({
    // This is the id of our referenced div-element
    // only this element and everything in it
    // will be connected to the data
    el: '#app',
    data: {
        svgWidth : "400",
        svgHeight : "800",
        margin: {top: 50, left: 100, bottom: 50, right: 50 },
        data:[],
        yearSelect:'year_1',
        tooltipVisible:false
    },
    mounted(){
        d3.csv('./data/complete_budget_df.csv').then(data =>{
            this.data.forEach((d,i) => d.index = i)
            this.data = data
        })
    },
    computed: {
        width() {
            return this.svgWidth - this.margin.left - this.margin.right;
        },
        height() {
            return this.svgHeight - this.margin.top - this.margin.bottom;
        },
        nested(){
            return d3.nest().key(d => d.broad).entries(this.data)
        },
        broad(){
            return this.data.map(item => item.broad)
            .filter((item, i, arr) => arr.indexOf(item) === i)
        },
        mid(){
            return this.data.map(item => item.mid)
            .filter((item, i, arr) => arr.indexOf(item) === i)
        },
        stack(){
            let keys = d3.range(d3.max(this.nested.map((d) => d.values.length)))
            let stackSetup = d3.stack()
                .keys(keys)
                .value((d,key) => key < d.values.length ? parseInt(d.values[key][this.yearSelect]) : 0 )
            return stackSetup(this.nested)
        },
        stackScale() {
            let y = d3.scaleLinear().range([this.height,0]).nice();
            let x = d3
            .scaleBand()
            .domain(this.broad)
            .range([0, this.width])
      
            y.domain([0,d3.max(this.nested, i => d3.sum(i.values, d => d[this.yearSelect]))]);

            let color = d3
            .scaleOrdinal()
            .domain(this.mid)
            .range(d3.schemeSet3)
            return { x, y,color };
          },
    },
    methods: { 
        tooltip(el){
            tooltip = d3.select('#tooltip')
                    .style("left", (event.clientX) + "px")		
                    .style("top", (event.clientY) + "px");	
            this.tooltipVisible = true;
            console.log(el)
            document.querySelector('#tooltip').innerHTML = `<h1>${el.narrow}</h1><span> Year ${this.yearSelect.split('_')[1]} Cost $${el[this.yearSelect]}</span>`;
        },
    },
    directives: {
        axis(el, binding) {
          const axis = binding.arg; // x or y
          const axisMethod = { x: "axisBottom", y: "axisLeft" }[axis];
          const methodArg = binding.value[axis];

          var t = d3.transition()
            .duration(500)
            .ease(d3.easeLinear)

          d3.select(el).transition(t).call(d3[axisMethod](methodArg));
        }
    }
});

