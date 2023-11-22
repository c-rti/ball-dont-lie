from urllib.request import urlopen
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
import os

# URL to scrape
url = "https://www.basketball-reference.com/awards/mvp.html"

# Collect HTML data
html = urlopen(url)

# Create BeautifulSoup object from HTML
soup = BeautifulSoup(html, features="lxml")

# Extract column headers into a list
headers = [th.getText() for th in soup.findAll('tr', limit=2)[1].findAll('th')]

# Remove the rank column
headers = headers[1:]

# Get rows from table
rows = soup.findAll('tr')[1:3]
rows_data = [[td.getText() for td in rows[i].findAll('td')] for i in range(len(rows))]

# Create the dataframe
previous_mvp = pd.DataFrame(rows_data, columns=headers)


previous_mvp = previous_mvp.drop(previous_mvp.columns[0], axis=1)
previous_mvp = previous_mvp.drop(0, axis=0)  # This will remove the second row

# Export dataframe to a CSV with the date in the filename
file_name = "data/previous_mvp.csv"

# Check if file exists and is not empty
# Check if file exists and is not empty
previous_mvp.to_csv(file_name, index=False)


print(previous_mvp)
