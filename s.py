from urllib.request import urlopen
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
import os

url = "https://www.basketball-reference.com/friv/mvp.html"

html = urlopen(url)

soup = BeautifulSoup(html, features="lxml")

headers = [th.getText() for th in soup.findAll('tr', limit=2)[0].findAll('th')]

headers = headers[1:]

rows = soup.findAll('tr')[1:6]
rows_data = [[td.getText() for td in rows[i].findAll('td')] for i in range(len(rows))]

mvp_race = pd.DataFrame(rows_data, columns=headers)

mvp_race = mvp_race.drop(mvp_race.columns[30], axis=1)

current_date = datetime.now()

date_str = current_date.strftime('%Y' + '-' + '%m' + '-' +'%d')

mvp_race['ScrapeDate'] = date_str

file_name = "data/mvp_race_2024.csv"

# List of all players that have appeared in the top 5
all_players = []

if os.path.isfile(file_name) and os.path.getsize(file_name) > 0:
    # Load the existing data
    existing_data = pd.read_csv(file_name, usecols=range(32))
    
    # Update the list of all players
    all_players = existing_data['Player'].unique().tolist()
    
    # Check if the players in all_players are in the current top 5
    mvp_race.to_csv(file_name, mode='a', header=False, index=False)
else:
    mvp_race.to_csv(file_name, index=False)

print(mvp_race)
