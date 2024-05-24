import json
import time
from selenium import webdriver
from bs4 import BeautifulSoup

driver = webdriver.Chrome()

def scrape_page(driver, url):
    driver.get(url)
    time.sleep(3)
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    results = soup.select("div.resultDescription")
    return [result.get_text(strip=True) for result in results]

base_url = "https://securingdemocracy.gmfus.org/social-data-search/"
params = "?q=*&account_country-Russia=true&product=(product eq 'Hamilton')&start-date=2023-01-01&end-date=2024-02-13&page="

all_results = []
target_count = 5000
page = 1

while len(all_results) < target_count:
    url = base_url + params + str(page)
    print(f"Scraping page {page}")
    results = scrape_page(driver, url)
    all_results.extend(results)
    page += 1
    time.sleep(1)

    if not results:
        print("No more results found, stopping.")
        break

all_results = all_results[:target_count]

data = {
    "russianPropaganda": all_results
}

with open('data_5000.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print(f"Scraped {len(all_results)} items and saved to data.json")

driver.quit()

