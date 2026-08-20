# BIIH-148 to BIIH-172

## BIIH-148

### Title
UI - Line chart legend sort order is not as per expected.

### Summary
UI - Line chart legend sort order is not as per expected.

### Description
In the *Line Chart*, the legend items should be sorted in descending order based on the data values, as defined in the specifications. Currently, the legend is being displayed in alphabetical order by product name, which does not align with the expected behavior.

*Expected Behavior:*
Legend entries should be ordered in descending order of their corresponding data values.

*Actual Behavior:*
Legend entries are currently sorted alphabetically by product name.

*Impact:*
This issue has been observed across multiple catIds/reports in OA and should be updated to comply with the specification.
Reference report link in OA: https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381

*Screenshot:* 
 !Screenshot 2026-08-07 at 11.29.47.png|thumbnail! 

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## BIIH-149

### Title
UI - Line Chart X-axis Month, Year, N & Dr values are not as per the reference slide.

### Summary
UI - Line Chart X-axis Month, Year, N & Dr values are not as per the reference slide.

### Description
In the OA UI Line Chart X-axis Month ,Year and N & Dr values are displaying in a single line whereas in the reference slide it is displaying in multiple lines. Also when the month is single digit ie Jan month is displaying as 01 in OA UI but in the reference slide it is displaying as 1.

*Expected Behavior:*
Line Chart X-axis Month,Year,N & Dr values should be in multiple lines as per slides and also Month can be formatted as per reference slide

*Actual Behavior:*
Currently Line chart X-axis Month,Year and N & Dr are displaying in the same line and Monnth is formatted in two digits always.

*Impact:*

This issue has been observed across multiple CAT Ids/reports in OA and should be updated to comply with the specification.
Reference report link in OA: [https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381|http://example.com/]

*Screenshot:*

!OA UI 1511 X axis discrepency.png|width=257,height=131!

 

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## BIIH-150

### Title
UI - In Line Chart tool tip n & dr values are  missing & Pie chart tool tip data  is not showing exactly as per CDOM reports

### Summary
UI - In Line Chart tool tip n & dr values are  missing & Pie chart tool tip data  is not showing exactly as per CDOM reports

### Description
 In the UI Line chart tool tip n & dr value is missing and in the Pie chart rounded off values are coming outside brackets and exact values are displaying inside brackets. In CDOM PPT rounded off values are displaying inside brackets.

*Expected Behavior:*
Line chart tool tip should have n & dr values as well & Pie chart tool tip  should be as per CDOM reports.

*Actual Behavior:*
Currently n & dr is missing in the Line chart tool tip and Pie chart tool tip is not displaying as per CDOM.

*Impact:*
This issue has been observed across multiple CAT Ids/reports in OA and should be updated to comply with the specification.
Reference report link in OA: [https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381]

!OA UI Pie chart tool tip issue.png|thumbnail!

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## BIIH-151

### Title
UI - Pie chart title is not as per the title displayed in the reference slide and footer alignment is improper.

### Summary
UI - Pie chart title is not as per the title displayed in the reference slide and footer alignment is improper.

### Description
In the OA UI & export Pie chart title format is not as per reference slide. Month & Year is displaying here but not in CDOM PPT.Also pipe symbol is used as a separator in OA but semicolon is used in reference slide.

Also the report footer definition should be moved little to the right. It should align with the starting of the line below the report title.

*Expected Behavior:*
In the OA UI and export Pie chart title should be as per the reference slide given.

*Actual Behavior:*
In the OA UI and export Pie chart title is not as per the reference slide given.

*Impact:*
This issue has been observed across multiple CAT Ids/reports in OA and should be updated to comply with the specification.
Reference report link in OA: [https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381]
!OA UI Pie chart title and footer alignment issue.png|width=375,height=199!

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## BIIH-152

### Title
UI - Jardiance brand line weight is not as per PLUM  and also time period not syncing between header and line chart.

### Summary
UI - Jardiance brand line weight is not as per PLUM  and also time period not syncing between header and line chart.

### Description
Jardiance brand line weight is configured as 3 pts in PLUM but in OA UI it is displaying in 1 pts only. Also the current time period is displaying as 7/26 in Line chart X-axis  but in the header selection it is displaying as Month June 2026.

*Expected Behavior:*

In the Line chart , line weight of all brands should be as per the weights configured in PLUM and also Line chart X axis latest time period should be same as in the report selections header.

*Actual Behavior:*
Currently Line chart X-axis latest time period is not syncing with the report header selections and also all the brands line weight is displaying as 1 pts only irrespective of the PLUM configuration.

*Impact:*

This issue has been observed across multiple CAT Ids/reports in OA and should be updated to comply with the specification.
Reference report link in OA: [https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381]

!UI Jardiance line weight and time period issue.png|width=315,height=167!

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## BIIH-153

### Title
UI - Report header metadata displays metadata category prefixes in OA instead of showing only selected values

### Summary
UI - Report header metadata displays metadata category prefixes in OA instead of showing only selected values

### Description
In the report's top-right header metadata section, OA displays the metadata category names as prefixes to the selected values (for example, Speciality:, Dataset:, Segment:, Client:, Market:, Period: ).

As per the CDOM behaviour and product requirement, only the selected metadata values should be displayed without the corresponding metadata category prefixes. OA is not aligned with the expected behaviour and shows additional metadata labels.

*Expected Behavior:*
The report header metadata section should display only the selected metadata values, consistent with CDOM behaviour.
Example:
* PCP, ENDO
* In Person
* Total Network
* BrandImpact
* ABI PI Jardiance T2D_OA
* Month June 2026
Metadata category prefixes such as Speciality:, Dataset:, Segment:, Client:, Market:, and Period: should not be displayed.

*Actual Behavior:*
OA displays metadata category prefixes along with the selected values in the report header metadata section.
Example:
* Speciality: PCP, ENDO
* Dataset: In Person
* Segment: Total Network
* Client: BrandImpact
* Market: ABI PI Jardiance T2D_OA
* Period: Month June 2026

*Impact:*
Multiple CatIDs affected. The issue is observed across reports in OA. All reports currently display metadata category prefixes in the header metadata section.

Reference report link in OA: https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381

*Screenshot:*
 !OA report top right header issue.png|thumbnail! 

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## BIIH-154

### Title
UI - In the OA UI & Export Key takeaway section is missing.

### Summary
UI - In the OA UI & Export Key takeaway section is missing.

### Description
UI - In the OA UI & Export Key takeaway section is missing which is present in the reference slide.

*Expected Behavior:*

All the formatting in CDOM reports should be preserved in the OA report as well.

*Actual Behavior:*
In OA UI & export Key takeaway section is missing .

*Impact:*
This issue has been observed across multiple CAT Ids/reports in OA and should be updated to comply with the specification.
Reference report link in OA: [https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381]

*Screenshot:*
!OA Export & UI Key takeaway and report title font size issue.png|thumbnail!

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## BIIH-155

### Title
Export - OA Export report title font size  is not in consistent and line chart tool tip  with the CDOM reports.

### Summary
Export - OA Export report title font size  is not in consistent and line chart tool tip  with the CDOM reports.

### Description
 OA Export report title font size is 18 and CDOM PPT report title font size is 17.User is unable to change the OA export font size to 17 as well in the OA PPT.Also the Line chart tool tip is displaying in rounded off values. But it should be in exact decimal values as in CDOM reports.

*Expected Behavior:*
All the font sizes and tool tip in OA report should be in consistent with CDOM PPT reports.

*Actual behavior:*
OA Export report title font size is 18 and CDOM PPT report font size is 17.User is unable to change the OA export font size to 17 as well in the OA PPT.Also the Line chart tool tip is displaying in rounded off values. But it should be in exact decimal values as in CDOM reports.

*Impact:*
This issue has been observed across multiple CAT Ids/reports in OA and should be updated to comply with the specification.

Reference report link in OA: [https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381]

*Screenshot:*

*!OA Export report title font size and tool tip.png|width=214,height=114!*

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## BIIH-157

### Title
UI - 1544 X-axis is not as per reference slide and dr value is missing for the first time period

### Summary
UI - 1544 X-axis is not as per reference slide and dr value is missing for the first time period

### Description
In 1544 UI  X-axis values are  not as per reference slide and dr value is missing for the first time period. Also the font sizes of Chart title and Y axis should be increased to be aligned with the reference slide given.

*Expected Behavior:*
Line Chart X-axis should be similar and the font size of the chart title and Y axis should be same as the reference slide.

*Actual Behavior:*
Currently  X-axis values are not as per reference slide and dr value is missing for the first time period.Also the font sizes of Chart title and Y axis should be increased to be aligned with the reference slide given.

*Impact:*
This issue has been observed across multiple CAT Ids/reports in OA and should be updated to comply with the specification.

Reference report link in OA:[https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1602]

*Screenshot:*

*!1544 UI X-sxis dr values issue.png|width=235,height=125!*

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: UI

## BIIH-158

### Title
UI - Line chart tool tip data % is missing and also not displaying in single decimal.

### Summary
UI - Line chart tool tip data % is missing and also not displaying in single decimal.

### Description
In the UI  Line chart tool tip data % is missing and also displaying in two decimals whereas in PPT report it is displaying in one decimal with % suffixed. 

*Expected Behavior:*
Line Chart tool tip data should be in one decimal and also % suffixed.

*Actual Behavior:*

In the UI  Line chart tool tip data % is missing and also displaying in two decimals whereas in PPT report it is displaying in one decimal with % suffixed. 

*Impact:*
This issue has been observed across multiple CAT Ids/reports in OA and should be updated to comply with the specification.

Reference report link in OA:[https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1602]

*Screenshot:*

!1544 Line chart tool tip issue.png|width=215,height=114!

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## BIIH-159

### Title
UI - Copyright disclaimer is missing all OA decks.

### Summary
UI - Copyright disclaimer is missing all OA decks.

### Description
In all CDOM PPT slides we use to see below copyright disclaimer in the lower left corner .But in all OA decks that is missing.

Copyright © 2026 IQVIA.
All rights reserved.

*Expected Behavior:*
In all OA decks copyright disclaimer should be present.

*Actual Behavior:*
Currently in OA decks copyright disclaimer is missing.

*Impact:*
This issue has been observed across multiple CAT Ids/reports in OA and should be updated to comply with the specification.
Reference report link in OA: https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381



### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## BIIH-160

### Title
Export - In the Embedded chart header is wrongly displaying and the data is displaying rounded off and % missing as well.

### Summary
Export - In the Embedded chart header is wrongly displaying and the data is displaying rounded off and % missing as well.

### Description
Export - In the Embedded chart header is wrongly displaying and the data is displaying rounded off.Data should display in exact decimal values with percentage suffixed.

*Expected Behavior:*
In the Pie chart and Line chart data should be exact decimal values with percentage suffixed.

*Actual Behavior:*
In the Embedded chart header is wrongly displaying and the data is displaying rounded off.Data should display in exact decimal values with percentage suffixed.

*Impact:*
This issue has been observed across multiple CAT Ids/reports in OA and should be updated to comply with the specification.
Reference report link in OA: [https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381]

*Screenshot:*

*!OA Export embedded chart issue.png|width=224,height=119!*

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## BIIH-161

### Title
UI - 1511 Mounjaro brand tool tip is not displaying the data values as expected.

### Summary
UI - 1511 Mounjaro brand tool tip is not displaying the data values as expected.

### Description
In 1511 Pie chart for Mounjaro Brand the tool tip data value decimals are not displaying  properly. All the other brand values are displaying as expected.

*Expected Behavior:*
In the Pie Chart for all the products tool tip should display the data values as expected.

*Actual Behavior:*

In the Pie Chart for all Mounjaro product tool tip is not displaying the data values as expected.

*Impact:*
This issue has been observed across multiple CAT Ids/reports in OA and should be updated to comply with the specification.
Reference report link in OA: [https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381]
*Screenshot:*

*!Pie chart Mounjero brand decimal values issue.png|width=182,height=97!*

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## BIIH-162

### Title
Export - Embedded Excel formatting in PPT export does not match CDOM

### Summary
Export - Embedded Excel formatting in PPT export does not match CDOM

### Description
The embedded Excel table formatting in the PPT export is not aligned with the expected CDOM formatting standards. CDOM serves as the baseline requirement, whereas OA is displaying inconsistent font styles, font sizes, and bold formatting across multiple table elements.
h3. Expected Behavior:

The embedded Excel table in the PPT export should match CDOM formatting: * 
*Product Names*
 * 
 ** Font: Aptos Narrow
 ** Font Size: 11
 ** Not Bold
 * *Period Header*

 ** Font: Aptos Narrow
 ** Font Size: 11
 ** Not Bold
 * *Product Values*

 ** Font: Aptos Narrow
 ** Font Size: 11

h3. Actual Behavior:

In OA PPT exports, the formatting differs from CDOM: * 
*Product Names*
 * 
 ** Font: Calibri
 ** Font Size: 10
 ** Bold
 * *Period Header*

 ** Font differs from CDOM
 ** Font Size: 10
 ** Bold
 * *Product Values*

 ** Font differs from CDOM
 ** Font Size: 8

h3. Impact:
 * Affects {*}multiple CAT-ID's{*}.
 * Causes inconsistent report presentation and formatting differences between OA exports and the CDOM standard.

h3. Reference Report Link in OA:

[https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1600]

!Embeded_Excel_Issue-2.png|width=533,height=403!

### Acceptance Criteria
h3. Expected Behavior:
The embedded Excel table in the PPT export should match CDOM formatting: * 
*Product Names*
 ** Font: Aptos Narrow
 ** Font Size: 11
 ** Not Bold
 * 
*Period Header*
 ** Font: Aptos Narrow
 ** Font Size: 11
 ** Not Bold
 * 
*Product Values*
 ** Font: Aptos Narrow
 ** Font Size: 11

### Metadata
- Type: Bug
- Priority: Low
- Labels: Export

## BIIH-163

### Title
UI - Line chart X-axis gridline is misaligned with X-axis labels

### Summary
UI - Line chart X-axis gridline is misaligned with X-axis labels

### Description
In the OA report, the line chart displays an X-axis gridline/tick position that is not properly aligned with the corresponding X-axis labels. This results in a visual inconsistency and may cause users to misinterpret the plotted data points and their associated categories/time periods.
h3. *Expected Behavior:*
The X-axis gridlines/tick marks should be synchronized and correctly aligned with their corresponding X-axis labels, ensuring accurate visual representation of the chart data.
h3. *Actual Behavior:*
One or more X-axis gridlines/tick marks appear offset and are not in sync with the X-axis labels displayed in the line chart.
*Impact:*

This issue has been observed across multiple CAT Ids/reports in OA and should be updated to comply with the specification.


Reference report link in OA: [https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381]

*Screenshot:*

!X axis tick marks not aligned with the corresponding labels.png|width=337,height=179!

 

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## BIIH-164

### Title
UI - 1511 Pie chart legend color marker missing and unnecessary colon displayed after brand name

### Summary
UI - 1511 Pie chart legend color marker missing and unnecessary colon displayed after brand name

### Description
In 1511 OA slide , the pie chart legend is missing the color marker associated with the legend values. Additionally, a colon : is displayed after the brand name, which does not match the expected formatting shown in the reference slide (CDOM requirement). This causes inconsistency in the chart presentation and reduces usability when interpreting pie chart segments.

*Expected Behavior:*
Each pie chart legend item should display its corresponding color marker.
The brand name should be displayed without a trailing colon, consistent with the reference slide/CDOM formatting.

*Actual Behavior:*
Color markers are missing from the pie chart legend.
A colon : is displayed after the brand name in OA.

*Impact:*
Affects 1511 CAT ID.
Users may find it difficult to associate pie chart segments with legend values when color indicators are missing.
Reference Report Link in OA:[https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381]


*Screenshot:*

!1511 Pie chart legend marker colon issue .png|width=164,height=87!

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## BIIH-165

### Title
Export -  Unnecessary line displayed below chart in OA export

### Summary
Export -  Unnecessary line displayed below chart in OA export

### Description
In the OA exported output , an unnecessary horizontal line is displayed below the chart. This extra line is not part of the expected report layout and creates a visual inconsistency in the exported deliverable. Based on the CDOM requirement, the export should not contain any additional line beneath the chart area.
 

*Expected Behavior:*

The exported chart should be displayed without any unnecessary line or artifact below the chart area.
h3. *Actual Behavior:*

An unwanted line is rendered below the chart in the OA export output.
h3. *Impact:*
 * *Multiple CAT IDs* (based on previously reported export/UI formatting issues affecting multiple report templates).
 * Impacts the visual quality and consistency of exported reports.

h3. Reference report link in OA:[https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1601]

*Screenshot:*
!1544 OA export unescessary line displaying below the chart.png|width=153,height=81!

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## BIIH-166

### Title
Export  - Embedded Excel product sorting is incorrect and unnecessary blue shading is displayed in top grid

### Summary
Export  - Embedded Excel product sorting is incorrect and unnecessary blue shading is displayed in top grid

### Description
In OA Export , the Embedded Excel component is not displaying products as expected. Products are currently being treated/displayed as a dimension and are sorted in alphabetical ascending order. As per the expected behavior (CDOM requirement baseline), products should be displayed based on the highest data values in descending order.
 
h3. *Expected Behavior:*
 * Products should be displayed and sorted by {*}highest data value (descending order){*}.
 * Product ordering should be driven by the underlying data values rather than alphabetical sorting.
 * The top grid should not display any unnecessary blue shading and should follow the expected report styling.

 
h3. *Actual Behavior:*
 * Products are displayed as a dimension and are sorted in {*}alphabetical ascending order{*}.
 * The top grid contains an unnecessary *blue shaded background* that should not be present.

h3. Impact:
 * *Affects multiple CAT IDs* .

h3. Reference Report Link in OA:[https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1602]

*Screenshot:*

*!Embedded Excel sorting order issue.png|width=160,height=85!*

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## BIIH-167

### Title
UI - Incorrect report definition description displayed for Line OA metric

### Summary
UI - Incorrect report definition description displayed for Line OA metric

### Description
*Description:*
The Report Definition description for the *Line > OA* metric in OA does not match the CDOM requirement. CDOM displays the metric as the product's *number* of indication details within the market, whereas OA displays it as the product's *share* of indication details within the market. This creates inconsistency between OA and the defined CDOM requirement and may lead to incorrect interpretation of the metric.
*Expected Behavior:*
OA should display the report definition description as:
{quote}"The product's number of indication details within the market."
{quote}
(as defined in CDOM).
*Actual Behavior:*
OA currently displays:
{quote}"The product's share of indication details within the market."
{quote}
The phrase *"number of"* has been incorrectly replaced with {*}"share of"{*}.
 
*Reference report link in OA:*
[https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1600]

 !CDOM Report Definition.png|thumbnail!    !Report Definition.png|thumbnail! 

### Acceptance Criteria
*Expected Behavior:*
OA should display the report definition description as:
{quote}"The product's number of indication details within the market."{quote}
(as defined in CDOM).

### Metadata
- Type: Bug
- Priority: Low
- Labels: UI

## BIIH-168

### Title
UI - Report Definition description contains extra full stop

### Summary
UI - Report Definition description contains extra full stop

### Description
*Description:*
The Report Definition description metric in OA does not match the CDOM requirement. CDOM is the expected baseline behavior, and OA is currently displaying an additional trailing full stop in the Report Definition description. The description should be updated to align with the CDOM requirement.
*Expected Behavior:*
The Report Definition description should display: 
Report Definition: (n = number of indication details within the market; dr = unique physicians reporting details for the market)
*Actual Behavior:*
The Report Definition description is currently displayed as: Report Definition: (n = number of indication details within the market; dr = unique physicians reporting details for the market).
*Impact:*
This issue affects *only certain CatIDs* (legacy report templates) and results in a metadata/description mismatch between OA and CDOM.
*Reference report link in OA:*
[Data Explorer - Customer 360|https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1601]
 
  !1543 report defn.png|thumbnail!
 

### Acceptance Criteria
*Expected Behavior:*
The Report Definition description should display: 
Report Definition: (n = number of indication details within the market; dr = unique physicians reporting details for the market)

### Metadata
- Type: Bug
- Priority: Low
- Labels: UI

## BIIH-169

### Title
Export - Line-and-marker legend symbol colors in OA export do not match CDOM requirement

### Summary
Export - Line-and-marker legend symbol colors in OA export do not match CDOM requirement

### Description
*Description:*
The line-and-marker legend symbol colors in the OA export do not match the expected behavior defined in CDOM. CDOM represents the requirement baseline, while the exported output from OA displays incorrect color assignments for the line-and-marker legend symbols. This results in a mismatch between OA exports and the expected CDOM output.
*Expected Behavior:*
The exported line-and-marker legend symbols should use the same color mapping as defined in CDOM for each corresponding series.
*Actual Behavior:*
The exported line-and-marker legend symbols display colors that differ from the CDOM requirement.
*Impact:*
This issue affects *only certain CatIDs*
*Reference report link in OA:*
*[Data Explorer - Customer 360|https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1601]*

*OA Report*

!1543 OA color exp .png|thumbnail!

*CDOM Report*

*!1543 color CDOM exp.png|thumbnail!*

 

### Acceptance Criteria
*Expected Behavior:*
The exported line-and-marker legend symbols should use the same color mapping as defined in CDOM for each corresponding series.

### Metadata
- Type: Bug
- Priority: Low
- Labels: Export

## BIIH-170

### Title
UI - V Bar Chart tooltip formatting does not match CDOM requirement

### Summary
UI - V Bar Chart tooltip formatting does not match CDOM requirement

### Description
In OA,  *V Bar Chart* tooltip is displaying values with *2 decimal places* and the {*}percentage (%) suffix is missing{*}. As per the CDOM requirement  tooltip values should be displayed with *1 decimal place* and suffixed with {*}%{*}.
 
h3. *Expected Behavior:*
 * Tooltip values in the V Bar Chart should be displayed with {*}1 decimal place{*}.
 * Tooltip values should be suffixed with the *%* symbol.
 * OA should match the formatting behavior defined in CDOM.

h3. *Actual Behavior:*
 * Tooltip values in the V Bar Chart are displayed with {*}2 decimal places{*}.
 * The *%* symbol is not displayed in the tooltip.

*Example:* {{45.67}}
h3. *Impact:*
 * {*}Affects multiple CAT IDs{*}, including {*}CAT ID 1515{*}.

 
Reference report link in OA:[https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1673]
 
*Screenshot:*
 
*!image-2026-08-13-16-10-30-412.png|width=195,height=104!*

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## BIIH-171

### Title
Export - PPT embedded Excel displays percentage values as rounded whole numbers

### Summary
Export - PPT embedded Excel displays percentage values as rounded whole numbers

### Description
*Description:*
In the PPT export, the embedded Excel file is displaying percentage metrics as rounded whole numbers for certain CatIDs. As per CDOM (expected behavior), percentage values should be retained and displayed accurately in the exported embedded Excel. OA is incorrectly rounding these percentage values to whole numbers, resulting in a mismatch between OA and CDOM.
*Expected Behavior:*
Percentage values in the PPT embedded Excel should be exported and displayed with the correct percentage formatting and precision, matching CDOM.
*Actual Behavior:*
Percentage values in the PPT embedded Excel are being rounded to whole numbers instead of being displayed as percentages, causing discrepancies between OA and CDOM.
*Impact:*
Affects only certain CatIDs 
*Reference report link in OA:*
*[Data Explorer - Customer 360|https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1601]*
 

*OA Report*

*!1543 OA PPT Excel.png|thumbnail!*

*CDOM Report*

*!1543 CDOM PPT Excel.png|thumbnail!*

 

### Acceptance Criteria
*Expected Behavior:*
Percentage values in the PPT embedded Excel should be exported and displayed with the correct percentage formatting and precision, matching CDOM.

### Metadata
- Type: Bug
- Priority: Low
- Labels: Export

## BIIH-172

### Title
Export - PPT legend font size in OA Export does not match CDOM legend font size.

### Summary
Export - PPT legend font size in OA Export does not match CDOM legend font size.

### Description
In the exported PPT, the legend font size generated from OA does not match the corresponding legend font size in CDOM. CDOM displays the legend with a font size of 9, whereas the OA export generates the legend with a font size of 8. This results in inconsistent formatting between OA Export and the expected CDOM PPT output.
 
*Expected Behavior:*
Legend font size in the OA exported PPT should match the CDOM PPT legend font size (Font Size = 9)
 
*Actual Behavior:*
Legend font size in the OA exported PPT is displayed as Font Size = 8, while the corresponding legend in CDOM PPT is Font Size = 9.
 
*Impact:*
Multiple CAT IDs might be affected.
 
Reference report link in OA:[https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1673]
 
*Screenshot:*
 
!Export legend font size mismatch.png|width=167,height=89!

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None

## Missing or Inaccessible Tickets

- BIIH-156 (HTTP 404)