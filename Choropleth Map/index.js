const URL_DATA =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const URL_TopoJSON =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

const margin = { top: 50, right: 20, bottom: 20, left: 20 };
const width = 950;
const height = 650;

const tooltip = d3
  .select(".container")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

const svg = d3
  .select(".container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const path = d3.geoPath();

const main = async () => {
  try {
    const promises = await Promise.all([
      d3.json(URL_DATA),
      d3.json(URL_TopoJSON),
    ]);
    const [data, topoJson] = promises;
    const counties = topojson.feature(topoJson, topoJson.objects.counties);

    const [min, max] = d3.extent(data, (d) => d.bachelorsOrHigher);

    const color = d3
      .scaleThreshold()
      .domain(d3.range(min, max, (max - min) / 8))
      .range(d3.schemeBlues[9]);

    const xScale = d3
      .scaleLinear()
      .domain([min, max])
      .range([width / 2, width - margin.right]);

    svg
      .append("g")
      .attr("transform", `translate(0,${margin.top})`)
      .selectAll("path")
      .data(counties.features)
      .join("path")
      .attr("d", path)
      .attr("class", "county")
      .attr("fill", (d) =>
        color(data.filter((el) => el.fips === d.id)[0].bachelorsOrHigher || 0)
      )
      .attr("data-fips", (d) => d.id)
      .attr(
        "data-education",
        (d) => data.filter((el) => el.fips === d.id)[0].bachelorsOrHigher || 0
      )
      .on("mouseover", (e, d) => {
        const result = data.filter((el) => el.fips === d.id)[0];
        tooltip
          .attr("data-education", result.bachelorsOrHigher)
          .html(() => {
            return `<p>${result.area_name} (${result.state})</p>  
            <p>${result.bachelorsOrHigher}%</p>  
            `;
          })
          .style("left", e.clientX + 15 + "px")
          .style("top", e.clientY + "px")
          .style("opacity", 1);
      })
      .on("mouseout", (e, d) => {
        tooltip.style("opacity", 0);
      });

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(-${width / 4},30)`)
      .call(
        d3
          .axisBottom(xScale)
          .tickFormat((x) => `${x.toFixed(1)}%`)
          .tickValues(color.domain())
      );

    const colorRange = color.range().map((r) => {
      const d = color.invertExtent(r);
      d[0] == null ? (d[0] = xScale.domain()[0]) : null;
      d[1] == null ? (d[1] = xScale.domain()[1]) : null;
      return d;
    });

    legend
      .selectAll("rect")
      .data(colorRange)
      .join("rect")
      .attr("x", (d) => xScale(d[0]))
      .attr("y", -10)
      .attr("width", (d) => xScale(d[1]) - xScale(d[0]))
      .attr("height", 10)
      .attr("fill", (d) => color(d[0]));
  } catch (error) {
    console.log(error);
  }
};

main();
