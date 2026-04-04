import requests
from bs4 import BeautifulSoup
import csv

# Hardcode your subpage URLs
subpages = [
    "https://www.highcampadventure.com/everest-trekking",
    "https://www.highcampadventure.com/annapurna-trekking",
    "https://www.highcampadventure.com/langtang-trekking",
    "https://www.highcampadventure.com/mustang-trekking",
    "https://www.highcampadventure.com/manaslu-trekking",
    "https://www.highcampadventure.com/off-the-beaten-path-trekking",
    "https://www.highcampadventure.com/other-trekking",
    "https://www.highcampadventure.com/short-trekking",
    "https://www.highcampadventure.com/restricted-area-trekking",
    "https://www.highcampadventure.com/dolpo-trekking",
    "https://www.highcampadventure.com/ganesh-himal-region-trekking",
    "https://www.highcampadventure.com/kanchenjunga-trekking",
    "https://www.highcampadventure.com/makalu-trekking",
]

all_treks = []

for url in subpages:
    print(f"Scraping: {url}")
    response = requests.get(url)
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        # Find all <a> tags within <h4> inside .package-list
        trek_elements = soup.select(".package-list h4 a")
        
        for elem in trek_elements:
            trek_name = elem.get_text(strip=True)
            all_treks.append(trek_name)
    else:
        print(f"Failed to retrieve {url} (Status Code: {response.status_code})")

# Remove duplicates
unique_trek_names = list(set(all_treks))

# Save to CSV
with open("all_treks.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Trek Name"])
    for trek_name in unique_trek_names:
        writer.writerow([trek_name])

print("\nDone! Only trek names have been saved to 'all_treks.csv'.")
