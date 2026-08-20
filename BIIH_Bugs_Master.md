# BIIH Bug Tickets Master Document

> **Last updated:** 2026-08-20 08:07:26 UTC
> **Project:** BIIH
> **Issue type:** Bug
> **Total bugs fetched:** 42

This is the master reference document for all Bug-type tickets in the BIIH project.
Ask to **update the bugs document** to refresh this file from Jira.

---

## Index

| Ticket ID | Title | Status | Priority | Labels |
|-----------|-------|--------|----------|--------|
| [BIIH-148](#biih-148) | UI - Line chart legend sort order is not as per expected. | Done | Low | None |
| [BIIH-149](#biih-149) | UI - Line Chart X-axis Month, Year, N & Dr values are not as per the reference slide. | Done | Low | None |
| [BIIH-150](#biih-150) | UI - In Line Chart tool tip n & dr values are  missing & Pie chart tool tip data  is not showing exactly as per CDOM reports | In Testing | Low | None |
| [BIIH-151](#biih-151) | UI - Pie chart title is not as per the title displayed in the reference slide and footer alignment is improper. | PO REVIEW | Low | None |
| [BIIH-152](#biih-152) | UI - Jardiance brand line weight is not as per PLUM  and also time period not syncing between header and line chart. | Done | Low | None |
| [BIIH-153](#biih-153) | UI - Report header metadata displays metadata category prefixes in OA instead of showing only selected values | Done | Low | None |
| [BIIH-154](#biih-154) | UI - In the OA UI & Export Key takeaway section is missing. | Done | Low | None |
| [BIIH-155](#biih-155) | Export - OA Export report title font size  is not in consistent and line chart tool tip  with the CDOM reports. | In Testing | Low | None |
| [BIIH-157](#biih-157) | UI - 1544 X-axis is not as per reference slide and dr value is missing for the first time period | In Testing | Low | UI |
| [BIIH-158](#biih-158) | UI - Line chart tool tip data % is missing and also not displaying in single decimal. | In Progress | Low | None |
| [BIIH-159](#biih-159) | UI - Copyright disclaimer is missing all OA decks. | To Do | Low | None |
| [BIIH-161](#biih-161) | UI - 1511 Mounjaro brand tool tip is not displaying the data values as expected. | To Do | Low | None |
| [BIIH-162](#biih-162) | Export - Embedded Excel formatting in PPT export does not match CDOM | PO REVIEW | Low | Export |
| [BIIH-163](#biih-163) | UI - Line chart X-axis gridline is missing or misaligned with X-axis labels | To Do | Low | None |
| [BIIH-164](#biih-164) | UI - 1511 Pie chart legend color marker missing and unnecessary colon displayed after brand name | To Do | Low | None |
| [BIIH-165](#biih-165) | Export -  Unnecessary line displayed below chart in OA export | To Do | Low | None |
| [BIIH-166](#biih-166) | Export  - Embedded Excel product sorting is incorrect and unnecessary blue shading is displayed in top grid | PO REVIEW | Low | None |
| [BIIH-167](#biih-167) | UI - Incorrect report definition description displayed for Line OA metric | To Do | Low | UI |
| [BIIH-168](#biih-168) | UI - Report Definition description contains extra full stop | To Do | Low | UI |
| [BIIH-169](#biih-169) | Export - Line-and-marker legend symbol colors in OA export do not match CDOM requirement | Rejected | Low | Export |
| [BIIH-170](#biih-170) | UI - V Bar Chart tooltip formatting does not match CDOM requirement | To Do | Low | None |
| [BIIH-171](#biih-171) | Export - PPT embedded Excel displays percentage values as rounded whole numbers | PO REVIEW | Low | Export |
| [BIIH-172](#biih-172) | Export - PPT legend font size and Y-axis title  in OA Export does not match CDOM legend font size. | To Do | Low | None |
| [BIIH-173](#biih-173) | Export - Donut chart is exported as Pie chart for certain CatIDs | To Do | Low | None |
| [BIIH-174](#biih-174) | UI - Y-axis title is missing '%' symbol and Y-axis line for certain CatIDs | To Do | Low | None |
| [BIIH-175](#biih-175) | Export - Chart title font is not retained as Arial 9 in exported output | To Do | Low | None |
| [BIIH-176](#biih-176) | UI - Data labels are displayed with bold outline styling and legend marker shape differs from expected rendering | To Do | Low | None |
| [BIIH-177](#biih-177) | Export - Y-axis formatting, chart title font styling, VBar stacked chart formatting, legend order, and Y-axis scale are not retained after export | To Do | Low | None |
| [BIIH-178](#biih-178) | UI/Export - Alignment discrepancies observed in title, key takeaway, metadata, and footer sections | Done | Low | None |
| [BIIH-179](#biih-179) | Export - Line chart markers and Y-axis vertical line are missing in exported output | To Do | Low | None |
| [BIIH-304](#biih-304) | Export - PPT Outline Name displays as "[No Title]" instead of configured outline name for certain CatIDs | To Do | Low | None |
| [BIIH-305](#biih-305) | UI - Incorrect Month Label Displayed in Detail Volume Report | To Do | Low | None |
| [BIIH-306](#biih-306) | UI - Slide title is not displayed in bold for certain CatIDs | Rejected | Low | None |
| [BIIH-307](#biih-307) | UI - OA VBAR slides display 0% even when no underlying data is available | To Do | Low | None |
| [BIIH-308](#biih-308) | Data - OA displays multiple indication categories instead of single product indication for CatID 1524 | To Do | High | None |
| [BIIH-309](#biih-309) | UI - Pie chart title displays additional current month and year | To Do | Low | None |
| [BIIH-310](#biih-310) | Data - OA output matches In Person data instead of All Encounters | In Testing | Low | None |
| [BIIH-311](#biih-311) | Export - Slide title position is misaligned in exported PPT | In Testing | Low | None |
| [BIIH-312](#biih-312) | Data - Embedded Excel rounds decimal values close to 1 as integer instead of the decimal value | Rejected | Low | None |
| [BIIH-313](#biih-313) | Export - Data labels are exported with incorrect font, size and colour | Rejected | Low | None |
| [BIIH-314](#biih-314) | UI - Chart section heading font weight does not match CDOM reference | To Do | Low | None |
| [BIIH-315](#biih-315) | UI - % Two-Way Discussion chart Y-axis scale does not match CDOM in OA UI and Export | To Do | Low | None |

---

## BIIH-148

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-148

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
- Status: Done
- Created: 2026-08-07T07:48:58.579+0200
- Updated: 2026-08-18T11:04:59.805+0200
- Reporter: drajesh
- Assignee: drajesh
- Components: None
- Fix Version/s: None

---

## BIIH-149

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-149

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
- Status: Done
- Created: 2026-08-07T10:11:41.440+0200
- Updated: 2026-08-20T07:24:54.378+0200
- Reporter: drajesh
- Assignee: drajesh
- Components: None
- Fix Version/s: None

---

## BIIH-150

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-150

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
- Status: In Testing
- Created: 2026-08-07T13:01:13.304+0200
- Updated: 2026-08-19T11:12:52.279+0200
- Reporter: drajesh
- Assignee: drajesh
- Components: None
- Fix Version/s: None

---

## BIIH-151

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-151

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
- Status: PO REVIEW
- Created: 2026-08-07T15:41:09.952+0200
- Updated: 2026-08-19T18:48:08.233+0200
- Reporter: drajesh
- Assignee: drajesh
- Components: None
- Fix Version/s: None

---

## BIIH-152

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-152

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
- Status: Done
- Created: 2026-08-10T04:21:14.237+0200
- Updated: 2026-08-20T08:07:59.761+0200
- Reporter: drajesh
- Assignee: drajesh
- Components: None
- Fix Version/s: None

---

## BIIH-153

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-153

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
- Status: Done
- Created: 2026-08-10T04:40:31.750+0200
- Updated: 2026-08-18T11:04:59.683+0200
- Reporter: sreddybuddamallagari
- Assignee: drajesh
- Components: None
- Fix Version/s: None

---

## BIIH-154

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-154

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
- Status: Done
- Created: 2026-08-10T07:13:48.159+0200
- Updated: 2026-08-18T11:04:59.498+0200
- Reporter: drajesh
- Assignee: drajesh
- Components: None
- Fix Version/s: None

---

## BIIH-155

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-155

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
- Status: In Testing
- Created: 2026-08-10T14:18:18.850+0200
- Updated: 2026-08-20T08:31:45.529+0200
- Reporter: drajesh
- Assignee: drajesh
- Components: None
- Fix Version/s: None

---

## BIIH-157

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-157

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
- Status: In Testing
- Created: 2026-08-11T11:42:32.616+0200
- Updated: 2026-08-20T08:11:23.896+0200
- Reporter: drajesh
- Assignee: drajesh
- Components: None
- Fix Version/s: None

---

## BIIH-158

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-158

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
- Status: In Progress
- Created: 2026-08-11T11:56:56.984+0200
- Updated: 2026-08-20T09:22:51.370+0200
- Reporter: drajesh
- Assignee: sreddybuddamallagari
- Components: None
- Fix Version/s: None

---

## BIIH-159

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-159

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
- Status: To Do
- Created: 2026-08-11T12:14:59.857+0200
- Updated: 2026-08-20T09:24:04.015+0200
- Reporter: drajesh
- Assignee: sreddybuddamallagari
- Components: None
- Fix Version/s: None

---

## BIIH-161

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-161

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
- Status: To Do
- Created: 2026-08-12T07:12:36.452+0200
- Updated: 2026-08-14T15:29:57.679+0200
- Reporter: drajesh
- Assignee: sreddybuddamallagari
- Components: None
- Fix Version/s: None

---

## BIIH-162

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-162

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
- Status: PO REVIEW
- Created: 2026-08-12T14:11:55.624+0200
- Updated: 2026-08-20T08:32:16.585+0200
- Reporter: u1198198
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-163

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-163

### Title
UI - Line chart X-axis gridline is missing or misaligned with X-axis labels

### Summary
UI - Line chart X-axis gridline is missing or misaligned with X-axis labels

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
- Status: To Do
- Created: 2026-08-12T19:51:32.308+0200
- Updated: 2026-08-20T10:05:09.442+0200
- Reporter: drajesh
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-164

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-164

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
- Status: To Do
- Created: 2026-08-12T20:40:29.222+0200
- Updated: 2026-08-18T12:00:43.257+0200
- Reporter: drajesh
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-165

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-165

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
- Status: To Do
- Created: 2026-08-12T20:57:11.850+0200
- Updated: 2026-08-19T12:57:11.578+0200
- Reporter: u1148028
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-166

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-166

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
- Status: PO REVIEW
- Created: 2026-08-13T07:07:07.157+0200
- Updated: 2026-08-20T08:33:12.618+0200
- Reporter: drajesh
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-167

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-167

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
- Status: To Do
- Created: 2026-08-13T09:08:55.540+0200
- Updated: 2026-08-18T11:51:24.311+0200
- Reporter: u1198198
- Assignee: u1148028
- Components: None
- Fix Version/s: None

---

## BIIH-168

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-168

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
- Status: To Do
- Created: 2026-08-13T12:10:42.740+0200
- Updated: 2026-08-14T15:18:13.020+0200
- Reporter: u1198183
- Assignee: sreddybuddamallagari
- Components: None
- Fix Version/s: None

---

## BIIH-169

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-169

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
- Status: Rejected
- Created: 2026-08-13T12:31:13.314+0200
- Updated: 2026-08-20T08:18:50.602+0200
- Reporter: u1198183
- Assignee: u1139756
- Components: None
- Fix Version/s: None

---

## BIIH-170

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-170

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
- Status: To Do
- Created: 2026-08-13T12:41:13.335+0200
- Updated: 2026-08-18T11:10:36.298+0200
- Reporter: drajesh
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-171

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-171

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
- Status: PO REVIEW
- Created: 2026-08-13T12:54:12.318+0200
- Updated: 2026-08-20T08:34:33.520+0200
- Reporter: u1198183
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-172

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-172

### Title
Export - PPT legend font size and Y-axis title  in OA Export does not match CDOM legend font size.

### Summary
Export - PPT legend font size and Y-axis title  in OA Export does not match CDOM legend font size.

### Description
In the exported PPT, the legend and Y-axis title font size  generated from OA does not match the corresponding legend font size in CDOM. CDOM displays the legend and Y-axis title with a font size of 9, whereas the OA export generates the legend and Y-axis title with a font size of 8. This results in inconsistent formatting between OA Export and the expected CDOM PPT output.
 
*Expected Behavior:*
Legend & Y-axis title font size in the OA exported PPT should match the CDOM PPT legend font size (Font Size = 9)
 
*Actual Behavior:*
Legend & Y-axis title font size in the OA exported PPT is displayed as Font Size = 8, while the corresponding legend in CDOM PPT is Font Size = 9.
 
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
- Status: To Do
- Created: 2026-08-13T20:03:20.811+0200
- Updated: 2026-08-18T13:24:55.494+0200
- Reporter: drajesh
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-173

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-173

### Title
Export - Donut chart is exported as Pie chart for certain CatIDs

### Summary
Export - Donut chart is exported as Pie chart for certain CatIDs

### Description
*Description:*
For certain CatIDs, the chart is configured and displayed as a Donut chart in OA. However, when the report is exported, the chart is rendered as a Pie chart instead of preserving the Donut chart format. This results in a mismatch between the report view and the exported output.
*Expected Behavior:*
The exported file should preserve the chart type and display the chart as a Donut chart, consistent with the OA report view and expected report configuration.
*Actual Behavior:*
The exported output displays a Pie chart instead of a Donut chart for certain CatIDs.
*Impact:*
Affects only certain CatIDs (legacy report templates). Exported deliverables do not accurately represent the chart format configured in OA.
*Reference report link in OA:*
[https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381]
!CHART.png|thumbnail!

### Acceptance Criteria
Expected Behavior:
The exported file should preserve the chart type and display the chart as a Donut chart, consistent with the OA report view and expected report configuration.

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: To Do
- Created: 2026-08-14T08:55:50.966+0200
- Updated: 2026-08-18T13:24:00.571+0200
- Reporter: sreddybuddamallagari
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-174

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-174

### Title
UI - Y-axis title is missing '%' symbol and Y-axis line for certain CatIDs

### Summary
UI - Y-axis title is missing '%' symbol and Y-axis line for certain CatIDs

### Description
*Description:*
For certain CatIDs, OA does not render the Y-axis title completely. The '%' symbol is missing from the Y-axis title, and the Y-axis line is also not displayed. CDOM represents the expected behavior, where both the Y-axis title (including the '%' symbol) and the Y-axis line are displayed correctly. This creates a visual inconsistency and may lead to incorrect interpretation of percentage-based metrics in OA.
*Expected Behavior:* * The Y-axis title should display the '%' symbol correctly.
 * The Y-axis line should be visible and rendered as per the chart configuration.
 * OA should match the behavior observed in CDOM.

*Actual Behavior:* * The '%' symbol is not displayed in the Y-axis title.
 * The Y-axis line is missing from the chart.
 * The chart appears incomplete compared to the expected CDOM rendering.

*Impact:*
Affects only certain CatIDs (legacy report templates).
*Reference report link in OA:*
[https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381]
!Line.png|thumbnail!

### Acceptance Criteria
*Expected Behavior:* * The Y-axis title should display the '%' symbol correctly.
 * The Y-axis line should be visible and rendered as per the chart configuration.
 * OA should match the behavior observed in CDOM.

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: To Do
- Created: 2026-08-14T09:10:23.310+0200
- Updated: 2026-08-20T10:06:03.927+0200
- Reporter: sreddybuddamallagari
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-175

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-175

### Title
Export - Chart title font is not retained as Arial 9 in exported output

### Summary
Export - Chart title font is not retained as Arial 9 in exported output

### Description
*Description:*
For certain CatIDs, the chart title is configured with *Arial font, size 9* in the digital slide. However, when the report is exported, the chart title font style does not retain the configured formatting and appears different in the exported output. CDOM represents the expected behavior, where the exported chart title should match the formatting defined in the digital slide.
*Expected Behavior:* * The chart title in the exported output should retain the same font formatting as configured in the digital slide.
 * Font family should be *Arial* and font size should be {*}9{*}.
 * Exported output should match the digital slide presentation.

*Actual Behavior:* * The chart title font style in the exported output does not appear as {*}Arial 9{*}.
 * Formatting differs from the digital slide configuration.

*Impact:*
Affects only certain CatIDs.
 
*Reference report link in OA:*
[https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381]

!image (1).png|thumbnail!

### Acceptance Criteria
*Expected Behavior:* * The chart title in the exported output should retain the same font formatting as configured in the digital slide.
 * Font family should be *Arial* and font size should be {*}9{*}.
 * Exported output should match the digital slide presentation.

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: To Do
- Created: 2026-08-14T09:20:40.482+0200
- Updated: 2026-08-20T08:16:21.083+0200
- Reporter: sreddybuddamallagari
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-176

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-176

### Title
UI - Data labels are displayed with bold outline styling and legend marker shape differs from expected rendering

### Summary
UI - Data labels are displayed with bold outline styling and legend marker shape differs from expected rendering

### Description
*Description:*
For certain CatIDs, chart rendering in OA differs from the expected CDOM behavior. Data labels are displayed with {*}bold formatting and an outline{*}, making them visually different from the expected chart styling. Additionally, {*}legend markers are rendered as circular shapes{*}, whereas the expected rendering is square markers. OA should align with the CDOM presentation and display chart elements consistently.
*Expected Behavior:* * Data labels should be displayed using the configured font styling without unexpected bold formatting or outlines.
 * Legend markers should be displayed as *square* shapes, consistent with CDOM and chart specifications.
 * Chart formatting should be consistent across OA and CDOM.

*Actual Behavior:* * Data labels are displayed in {*}bold with an outline{*}.
 * Legend markers are displayed as *circular* shapes in OA.
 * Chart appearance differs from the expected rendering.

*Impact:*
Affects only certain CatIDs (legacy report templates).
*Reference report link in OA:*
https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381

### Acceptance Criteria
*Expected Behavior:* * Data labels should be displayed using the configured font styling without unexpected bold formatting or outlines.
 * Legend markers should be displayed as *square* shapes, consistent with CDOM and chart specifications.
 * Chart formatting should be consistent across OA and CDOM.

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: To Do
- Created: 2026-08-14T09:25:33.248+0200
- Updated: 2026-08-19T10:40:45.695+0200
- Reporter: u1148028
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-177

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-177

### Title
Export - Y-axis formatting, chart title font styling, VBar stacked chart formatting, legend order, and Y-axis scale are not retained after export

### Summary
Export - Y-axis formatting, chart title font styling, VBar stacked chart formatting, legend order, and Y-axis scale are not retained after export

### Description
*Description:*
For certain CatIDs, multiple chart formatting discrepancies are observed in the exported output compared to the digital slide/CDOM rendering. The exported charts do not retain several formatting attributes, resulting in visual and structural differences from the expected presentation. CDOM represents the expected behavior, and OA exports should preserve the chart configuration and formatting defined in the digital slide.
*Expected Behavior:* * Y-axis vertical line should be visible in the exported chart.
 * Chart title should retain the default formatting of {*}Arial, size 9, Bold{*}.
 * VBar stacked chart formatting should be preserved in the exported output.
 * Legend order should match the order displayed in Data Explorer/digital slide.
 * Y-axis scale should retain the configured values (for example: {*}0, 50, 100{*}) and match the digital slide.

*Actual Behavior:* * Y-axis vertical line is missing in the exported chart.
 * Chart title is not displayed using the default *Arial 9 Bold* formatting.
 * VBar stacked chart formatting changes after export.
 * Legend order is not retained in the exported output.
 * Y-axis scale is rendered with intervals of *10* instead of the expected *0, 50, 100* scale shown in Data Explorer.

*Impact:*
Affects only certain CatIDs (legacy report templates).
*Reference report link in OA:*
[https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381]

!VBar.png|thumbnail!

### Acceptance Criteria
*Expected Behavior:* * Y-axis vertical line should be visible in the exported chart.
 * Chart title should retain the default formatting of {*}Arial, size 9, Bold{*}.
 * VBar stacked chart formatting should be preserved in the exported output.
 * Legend order should match the order displayed in Data Explorer/digital slide.
 * Y-axis scale should retain the configured values (for example: {*}0, 50, 100{*}) and match the digital slide.

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: To Do
- Created: 2026-08-14T09:30:07.158+0200
- Updated: 2026-08-19T10:52:12.402+0200
- Reporter: u1148028
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-178

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-178

### Title
UI/Export - Alignment discrepancies observed in title, key takeaway, metadata, and footer sections

### Summary
UI/Export - Alignment discrepancies observed in title, key takeaway, metadata, and footer sections

### Description
*Description:*
When comparing the OA report and generated PPT against the CDOM/baseline PPT, alignment inconsistencies are observed across both the {*}UI and exported output{*}. The affected areas include the {*}title section, key takeaway text box, right-side metadata fields, and footer components{*}. CDOM represents the expected behavior, and both OA and exported PPT should maintain the same positioning, spacing, and alignment of all report elements.
*Expected Behavior:* * Title section should be aligned consistently with the CDOM/baseline PPT.
 * Key takeaway text box should retain the expected position and spacing.
 * Right-side metadata fields should be properly aligned.
 * Footer components should maintain the expected layout and positioning.
 * Both OA and exported PPT should visually match the baseline PPT without alignment shifts.

*Actual Behavior:* * Alignment discrepancies are observed in both the OA UI and the exported PPT when compared to the baseline PPT.
 * Title section, key takeaway text box, right-side metadata fields, and footer components are not positioned as expected.
 * Visual layout and spacing differ from the CDOM/baseline presentation.

*Impact:*
Affects only certain CatIDs (legacy report templates).
*Reference report link in OA:*
https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1381
!Allignment.png|thumbnail!

### Acceptance Criteria
*Expected Behavior:* * Title section should be aligned consistently with the baseline PPT.
 * Key takeaway text box should retain its expected position and spacing.
 * Right-side metadata fields should be aligned as per the baseline PPT.
 * Footer components should maintain the expected layout and positioning.
 * Exported PPT should visually match the baseline PPT without alignment shifts.

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: Done
- Created: 2026-08-14T11:33:53.672+0200
- Updated: 2026-08-20T08:08:46.137+0200
- Reporter: u1198198
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-179

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-179

### Title
Export - Line chart markers and Y-axis vertical line are missing in exported output

### Summary
Export - Line chart markers and Y-axis vertical line are missing in exported output

### Description
In OA, when exporting line chart templates, the exported output does not display the line markers and the Y-axis vertical line. These chart elements are expected to be present in the export to ensure consistency between the on-screen visualization and the exported file. The issue has been observed across multiple CatIDs, indicating a broader export rendering defect rather than a template-specific problem.
h3. Expected Behavior:
 * Exported line charts should display all configured line markers.
 * The Y-axis vertical line should be visible in the exported output.
 * Exported charts should match the chart formatting and visualization displayed within OA.

h3. Actual Behavior:
 * Line markers are missing in the exported line charts.
 * The Y-axis vertical line is not displayed in the exported output.
 * The exported chart does not fully match the visualization shown in OA.

h3. Impact:
 * *Affects multiple CatIDs* (legacy report templates).
 * Users receive incomplete chart visualizations in exported reports, which may impact analysis and presentation quality.

h3. Reference Report Link in OA:

[Data Explorer - Customer 360|https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1601]

 
 

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: To Do
- Created: 2026-08-14T11:58:55.436+0200
- Updated: 2026-08-20T08:17:24.987+0200
- Reporter: sreddybuddamallagari
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-304

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-304

### Title
Export - PPT Outline Name displays as "[No Title]" instead of configured outline name for certain CatIDs

### Summary
Export - PPT Outline Name displays as "[No Title]" instead of configured outline name for certain CatIDs

### Description
h3. Description:

For certain CatIDs, the exported PPT displays *"[No Title]"* in the PowerPoint Outline/Navigation Pane even though the slide contains a valid title and a configured outline name.
As per the expected behavior (CDOM baseline), the Outline/Navigation Pane should display the configured outline name (e.g., {*}"SoA - IP & NIP"{*}) for the slide. However, in OA exports, the Outline/Navigation Pane shows {*}"[No Title]"{*}, indicating that the slide's outline/title placeholder is not being populated correctly during PPT generation.
h3. Expected Behavior:

The exported PPT should display the configured slide outline name, such as {*}"SoA - IP & NIP"{*}, in the PowerPoint Outline/Navigation Pane for the slide.
!image (2).png|thumbnail!
h3. Actual Behavior:

For certain CatIDs, the exported PPT displays *"[No Title]"* in the PowerPoint Outline/Navigation Pane instead of the configured outline name.
!Slide_Layout_title_OA.png|thumbnail!
h3. Impact:
 * Affects {*}certain CatIDs{*}.
 * Users are unable to identify slides correctly from the PowerPoint Outline/Navigation Pane.
 * Navigation and review of exported presentations become difficult when multiple slides are present.
 * Results in inconsistency with the expected CDOM behavior.

### Acceptance Criteria
h3. Expected Behavior:
The exported PPT should display the configured slide outline name, such as {*}"SoA - IP & NIP"{*}, in the PowerPoint Outline/Navigation Pane for the slide.

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: To Do
- Created: 2026-08-18T09:24:01.861+0200
- Updated: 2026-08-20T08:17:51.422+0200
- Reporter: u1198198
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-305

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-305

### Title
UI - Incorrect Month Label Displayed in Detail Volume Report

### Summary
UI - Incorrect Month Label Displayed in Detail Volume Report

### Description
The month label displayed in the top-right corner of the Detail Volume report is incorrect.

*Actual Behavior:*

 "Month June 2026"

*Expected Behavior:*

 "Month Ending June 2026"

*Impact:*

The label does not accurately represent the reporting period and is inconsistent with the standard report terminology.

Reference report link in OA: https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1600

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: To Do
- Created: 2026-08-18T09:35:25.758+0200
- Updated: 2026-08-19T17:49:28.205+0200
- Reporter: yvk
- Assignee: sreddybuddamallagari
- Components: None
- Fix Version/s: None

---

## BIIH-306

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-306

### Title
UI - Slide title is not displayed in bold for certain CatIDs

### Summary
UI - Slide title is not displayed in bold for certain CatIDs

### Description
In OA, slide titles are not consistently rendered in *bold formatting* for certain CatIDs. Based on the expected report template behaviour (CDOM requirement), slide titles should appear in bold across all applicable slides. However, in OA, specific CatIDs display the slide title in regular font weight, resulting in inconsistent report presentation and formatting.
h3. Expected Behavior:
Slide titles should be displayed in *bold font* consistently across all slides and CatIDs, as defined by the report template requirements.
h3. Actual Behavior:
For certain CatIDs, the slide title is displayed in *regular (non-bold) font* in OA.
h3. Impact:
The issue affects *only certain CatIDs* (legacy report templates). This leads to inconsistent report formatting and may impact presentation quality and user perception of report standardisation.
h3. Reference report link in OA:
[OA Report|https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1600]

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: Rejected
- Created: 2026-08-18T10:10:15.881+0200
- Updated: 2026-08-19T14:45:54.673+0200
- Reporter: yvk
- Assignee: sreddybuddamallagari
- Components: None
- Fix Version/s: None

---

## BIIH-307

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-307

### Title
UI - OA VBAR slides display 0% even when no underlying data is available

### Summary
UI - OA VBAR slides display 0% even when no underlying data is available

### Description
In CDOM, VBAR charts do not display a percentage value when the underlying data is unavailable or effectively results in 0%. However, in OA VBAR slides, {*}0% is displayed even when there is no supporting data{*}.
Since CDOM represents the expected behavior, OA should suppress the display of 0% values when no data exists. This discrepancy is observed across VBAR CAT IDs and results in inconsistent chart interpretation between CDOM and OA.
 
h3. Expected Behavior:
For VBAR slides, when there is no underlying data available for a metric, OA should follow CDOM behavior and *not display a 0% value* in the chart.
h3. Actual Behavior:
OA VBAR slides display *0%* even when there is no underlying data available for the corresponding metric.
h3. Impact:
 * Affects *multiple VBAR CAT IDs* (legacy report templates).

 
*Reference Report Link in OA: [https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1603]*
 
!CAT ID 1514 V BAR 0 percentage displaying when there is no data .png|width=222,height=118!

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: To Do
- Created: 2026-08-18T10:55:46.591+0200
- Updated: 2026-08-18T10:55:46.628+0200
- Reporter: drajesh
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-308

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-308

### Title
Data - OA displays multiple indication categories instead of single product indication for CatID 1524

### Summary
Data - OA displays multiple indication categories instead of single product indication for CatID 1524

### Description
h3. Description:

CDOM (expected behavior) displays a single indication/product category in the chart, whereas OA displays multiple indication categories for the same report.
For {*}CatID 1524{*}, CDOM shows only *"Diabetes Type II"* as the indication category and displays a single corresponding legend entry. However, OA displays multiple indication categories including {*}Diabetes Type II, Reduce CV Risk, Heart Failure, and Chronic Kidney Disease{*}.
As a result, the chart composition and indication distribution in OA do not match the CDOM reference output.
h3. Expected Behavior:

OA should match CDOM and display a single indication/product category: * Diabetes Type II

Only one corresponding legend entry should be displayed in the chart.
!Screenshot 2026-08-18 114436.png|thumbnail!
h3. Actual Behavior:

OA displays multiple indication categories: * Diabetes Type II
 * Reduce CV Risk
 * Heart Failure
 * Chronic Kidney Disease

Multiple legend entries are shown, resulting in a chart composition that differs from the CDOM reference.

!Screenshot 2026-08-18 114347.png|thumbnail!
h3. Impact:
 * Affects *CatID 1524* only.
 * Users may interpret indication distribution incorrectly due to the inclusion of additional indication categories not present in the CDOM output.
 * Data displayed in OA is inconsistent with the expected CDOM behavior.

### Acceptance Criteria
h3. Expected Behavior:
OA should match CDOM and display a single indication/product category: * Diabetes Type II

Only one corresponding legend entry should be displayed in the chart.

### Metadata
- Type: Bug
- Priority: High
- Labels: None
- Status: To Do
- Created: 2026-08-18T11:40:13.940+0200
- Updated: 2026-08-19T14:04:20.403+0200
- Reporter: u1198198
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-309

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-309

### Title
UI - Pie chart title displays additional current month and year

### Summary
UI - Pie chart title displays additional current month and year

### Description
In OA, the pie chart title is displaying the current month and year as additional text. As per the expected behavior (CDOM requirement), the chart title should display only the configured title without automatically appending the current month and year. This issue is observed only for certain CatIDs.
h3. Expected Behavior:
The pie chart title should display only the intended/configured title and should not append the current month and year unless explicitly defined in the report configuration.
h3. Actual Behavior:
The pie chart title is automatically displaying the current month and year in addition to the configured title.
h3. Impact:
Affects *only certain CatIDs* (legacy-system report templates).
h3. Reference report link in OA:
[OA Report|https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1822]

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: To Do
- Created: 2026-08-18T12:38:01.101+0200
- Updated: 2026-08-18T12:38:01.101+0200
- Reporter: yvk
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-310

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-310

### Title
Data - OA output matches In Person data instead of All Encounters

### Summary
Data - OA output matches In Person data instead of All Encounters

### Description
In OA, the output data does not match the CDOM requirement. CDOM shows data based on {*}All Encounters{*}, whereas OA is displaying values that align with *In Person* data instead. As CDOM represents the expected behaviour, OA should reflect the All Encounters dataset for this report.
h3. Expected Behavior:
OA should display data that matches the *All Encounters* output as defined in CDOM.
h3. Actual Behavior:
OA is displaying data that matches the *In Person* output instead of {*}All Encounters{*}, resulting in a mismatch between OA and CDOM.
h3. Impact:
Affects *only certain CatIDs* (legacy-system report templates).
h3. Reference report link in OA:
[OA Report|https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1822]

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: In Testing
- Created: 2026-08-18T12:49:36.418+0200
- Updated: 2026-08-20T09:44:08.369+0200
- Reporter: yvk
- Assignee: drajesh
- Components: None
- Fix Version/s: None

---

## BIIH-311

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-311

### Title
Export - Slide title position is misaligned in exported PPT

### Summary
Export - Slide title position is misaligned in exported PPT

### Description
The slide title alignment is not rendered correctly in the exported PowerPoint from OA. While viewing the report in OA, the title positioning appears as expected; however, after exporting the report to PPT, the slide title is shifted/misaligned, resulting in an inconsistent presentation layout.
h3. Expected Behavior:
The slide title should maintain its intended position and alignment in the exported PPT, matching the layout displayed in OA and the expected report template formatting.
h3. Actual Behavior:
The slide title position is misaligned in the exported PPT, causing the title placement to appear incorrect and inconsistent with the report design.
h3. Impact:
 * Affects *only certain CatIDs* (legacy report templates).
 * Exported presentations require manual adjustment before sharing with stakeholders, impacting report usability and presentation quality.

h3. Reference report link in OA:
[View OA Report|https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1822#]

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: In Testing
- Created: 2026-08-18T13:41:47.199+0200
- Updated: 2026-08-20T09:47:15.467+0200
- Reporter: drajesh
- Assignee: drajesh
- Components: None
- Fix Version/s: None

---

## BIIH-312

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-312

### Title
Data - Embedded Excel rounds decimal values close to 1 as integer instead of the decimal value

### Summary
Data - Embedded Excel rounds decimal values close to 1 as integer instead of the decimal value

### Description
For {*}CatID 1515{*}, decimal values in the *embedded Excel* are being displayed as rounded whole numbers when the values are close to 1. This results in inaccurate data representation in OA.
The expected behaviour is to preserve and display the actual decimal values as per the source data/CDOM requirement. However, OA is displaying values such as *0.68* and *1.13* as *1* in the embedded Excel.
h3. Expected Behavior:
 * Embedded Excel should display the actual decimal values with the appropriate precision.
 * Values such as *0.68* should remain {*}0.68{*}, and *1.13* should remain {*}1.13{*}.
 * Numeric values should not be rounded to whole numbers unless explicitly defined by the business rules.

h3. Actual Behavior:
 * Decimal values close to 1 are being rounded and displayed as *1* in the embedded Excel.
 * Examples observed:
 ** *0.68 → 1*
 ** *1.13 → 1*

h3. Impact:
 * {*}Affects only CatID 1515{*}.
 * Users may interpret the data incorrectly due to loss of decimal precision.
 * Data displayed in embedded Excel does not accurately reflect the underlying values.
Reference report link in OA: [https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1673]
h3. Screenshot:

!image-2026-08-18-19-51-38-965.png|width=649,height=262!

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: Rejected
- Created: 2026-08-18T16:22:56.970+0200
- Updated: 2026-08-19T13:27:24.999+0200
- Reporter: hjindal
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-313

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-313

### Title
Export - Data labels are exported with incorrect font, size and colour

### Summary
Export - Data labels are exported with incorrect font, size and colour

### Description
In OA, data labels are displayed with the correct formatting; however, when the report is exported, the data labels do not retain the expected styling. According to the report requirement (CDOM baseline), data labels should be exported in {*}Arial font, size 8, and the configured label colour{*}. Instead, the exported output displays the labels in {*}Proxima Nova font, size 11, and a different colour{*}, resulting in a visual mismatch between OA and the exported deliverable.
h3. Expected Behavior:
 * Data labels in the exported output should match the formatting defined in OA/CDOM.
 * Data labels should be exported in:
 ** *Font:* Arial
 ** *Font Size:* 8
 ** *Colour:* Same as configured/displayed in OA

h3. Actual Behavior:
 * Data labels in the exported output are displayed with:
 ** *Font:* Proxima Nova
 ** *Font Size:* 11
 ** *Colour:* Different from the colour displayed in OA
 * Exported formatting does not match the OA report view.

h3. Impact:
 * Affects *CatID 1515* (legacy report template).

 
h3. Reference report link in OA:
[https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1673]
 
h3. Screenshot:
!image-2026-08-18-20-06-16-900.png|width=990,height=664!

### Acceptance Criteria
Not Found

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: Rejected
- Created: 2026-08-18T16:37:01.116+0200
- Updated: 2026-08-19T13:26:53.658+0200
- Reporter: hjindal
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-314

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-314

### Title
UI - Chart section heading font weight does not match CDOM reference

### Summary
UI - Chart section heading font weight does not match CDOM reference

### Description
*Description:*
In OA, the chart section headings *"Average Minutes"* and *"% Two-Way Discussion"* are displayed with a lighter/non-bold font weight. As per the CDOM reference, these labels are intended to appear as bold chart section headings. This creates a visual inconsistency between OA and the approved CDOM design specification.
 
*Expected Behavior:*
Chart section headings *"Average Minutes"* and *"% Two-Way Discussion"* should be displayed in {*}bold font weight{*}, consistent with the CDOM reference.

  !CDOM_Chart_Heading.png|thumbnail!
*Actual Behavior:*
Chart section headings *"Average Minutes"* and *"% Two-Way Discussion"* appear with a lighter/non-bold font weight in OA.

!Chart_Heading.png|thumbnail!
 
*Impact:*
Affects {*}only this CatID{*}.
 
*Reference Report Link in OA:*
[https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1870]

### Acceptance Criteria
*Expected Behavior:*
Chart section headings *"Average Minutes"* and *"% Two-Way Discussion"* should be displayed in {*}bold font weight{*}, consistent with the CDOM reference.

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: To Do
- Created: 2026-08-20T07:48:25.441+0200
- Updated: 2026-08-20T07:50:20.104+0200
- Reporter: u1198198
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## BIIH-315

**Jira URL:** https://jiraims.rm.imshealth.com/browse/BIIH-315

### Title
UI - % Two-Way Discussion chart Y-axis scale does not match CDOM in OA UI and Export

### Summary
UI - % Two-Way Discussion chart Y-axis scale does not match CDOM in OA UI and Export

### Description
*Description:*
In the *% Two-Way Discussion* chart, the Y-axis scale displayed in both the OA UI and exported output does not match the expected behavior observed in CDOM. CDOM serves as the baseline requirement and displays the Y-axis using percentage values with consistent interval spacing. However, OA renders a different numeric scale in both UI and Export, resulting in a mismatch in axis formatting, interval spacing, and maximum value.
*Expected Behavior:*
The *% Two-Way Discussion* chart should match the CDOM representation in both UI and Export: * Y-axis should be displayed as percentage values.
 * Scale should be: 0%, 10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90%.
 * Y-axis interval spacing should be 10%.
 * Y-axis maximum value should align with the CDOM reference.

*Actual Behavior:*
In both OA UI and Export, the *% Two-Way Discussion* chart displays the Y-axis as: * 0, 20, 40, 60, 80, 100, 120

Observed issues: * Percentage formatting is missing.
 * Interval spacing is 20 instead of 10%.
 * Maximum Y-axis value is 120.
 * UI and exported chart do not match the CDOM requirement.

*Impact:*
Affects *certain CatIDs* (legacy-system report templates).
*Reference report link in OA:*
[https://brandimpact-preprod.usv.oa.iqvia.com/data-explorer/slides/1870]

!Y_Axis.png|thumbnail!

### Acceptance Criteria
*Expected Behavior:*
The *% Two-Way Discussion* chart should match the CDOM representation in both UI and Export: * Y-axis should be displayed as percentage values.
 * Scale should be: 0%, 10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90%.
 * Y-axis interval spacing should be 10%.
 * Y-axis maximum value should align with the CDOM reference.

 

### Metadata
- Type: Bug
- Priority: Low
- Labels: None
- Status: To Do
- Created: 2026-08-20T09:57:27.637+0200
- Updated: 2026-08-20T09:57:53.675+0200
- Reporter: u1198198
- Assignee: Unassigned
- Components: None
- Fix Version/s: None

---

## Missing or Inaccessible Tickets

- None