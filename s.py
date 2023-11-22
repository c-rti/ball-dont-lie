from urllib.request import urlopen
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
import os

# URL to scrape
url = "https://www.basketball-reference.com/friv/mvp.html"

# Collect HTML data
html = urlopen(url)

# Create BeautifulSoup object from HTML
soup = BeautifulSoup(html, features="lxml")

# Extract column headers into a list
headers = [th.getText() for th in soup.findAll('tr', limit=2)[0].findAll('th')]

# Remove the rank column
headers = headers[1:]

# Get rows from table
rows = soup.findAll('tr')[1:6]
rows_data = [[td.getText() for td in rows[i].findAll('td')] for i in range(len(rows))]

# Create the dataframe
mvp_race = pd.DataFrame(rows_data, columns=headers)

# Drop the empty column by its location
# Assuming the empty column is the 30th column (0-indexed)
mvp_race = mvp_race.drop(mvp_race.columns[30], axis=1)

# Get the current date
current_date = datetime.now()

# Format the date as a string in the format 'YYYYMMDD'
date_str = current_date.strftime('%Y' + '-' + '%m' + '-' +'%d')

# Add a new column 'ScrapeDate' to the dataframe
mvp_race['ScrapeDate'] = date_str

# Export dataframe to a CSV with the date in the filename
file_name = "data/mvp_race_2024.csv"

# Check if file exists and is not empty
# Check if file exists and is not empty
if os.path.isfile(file_name) and os.path.getsize(file_name) > 0:
    # If file is not empty, append without writing the header
    mvp_race.to_csv(file_name, mode='a', header=False, index=False)
else:
    # If file is empty, write the header and data
    mvp_race.to_csv(file_name, index=False)


print(mvp_race)
