# How Built Environments Shape Robotaxi Crashes in San Francisco
[Wang, Shuai](https://github.com/shuaiwo); [Jiang, Emmanuel](https://github.com/emma6537); [Jun, Youngsang](https://github.com/yjmark)

Students of Stuart Weitzman School of Design, University of Pennsylvania

Advisors: Dr. Lin, Zhongjie; [Tang, Ziyi](https://github.com/tang-ziyi); [Yi, Shengao](https://github.com/ShengaoYi)

## Introduction
Robotaxi adoption is no longer hypothetical. This study provides visualization and modeling that show how built environments shape robotaxi crash risks in San Francisco, allowing planners and policymakers to implement a "Try-Before-You-Build” approach.

## File structure
### HTML, CSS, JS
First, you would want to start by trying the [web app](https://yjmark.github.io/robotaxi), which is built using files located in the [css](https://github.com/yjmark/robotaxi/blob/main/css), [data](https://github.com/yjmark/robotaxi/blob/main/data), [js](https://github.com/yjmark/robotaxi/blob/main/js) folders.

### Data
The data is divided into two categories: **crash data** and **built environment and sociodemographic parameters (independent variables)**. The final dataset used in the web app is [df_final_Sci3.geojson](https://github.com/yjmark/robotaxi/blob/main/data/model/df_final_Sci3.geojson), which includes all dependent and independent, as well as prediction values for each block group.

#### Crash data (points)
The crash data was originally obtained as individual incident reports in PDF format from [California DMV](https://www.dmv.ca.gov/portal/vehicle-industry-services/autonomous-vehicles/autonomous-vehicle-collision-reports/). These were parsed and consolidated into a single GeoJSON file using [parsing.py](https://github.com/yjmark/robotaxi/blob/main/data/layers/parsing.py). It was then uploaded to Firebase using [initialcrash.py](https://github.com/yjmark/robotaxi/blob/main/data/layers/initialcrash.py) as the initial dataset.

#### Dependent variable
The dependent variable is crash density, defined as the number of crashes per unit block group area (km²).

#### Independent variables
By mostly R, all independent variables are compiled and merged in the file [CBG 0411_elevationgeometryadded.csv](https://github.com/yjmark/robotaxi/blob/main/data/model/Data/CBG 0411_elevationgeometryadded.csv). They are processed and analyzed in [250429_Crash_BE.ipynb](https://github.com/yjmark/robotaxi/blob/main/data/model/250429_Crash_BE.ipynb). 

### Model
Variance Inflation Factor (VIF) analysis, Ordinary Least Squares (OLS) regression, and Random Forest (RF) modeling were conducted and visualized in [250429_Crash_BE.ipynb](https://github.com/yjmark/robotaxi/blob/main/data/model/250429_Crash_BE.ipynb).
