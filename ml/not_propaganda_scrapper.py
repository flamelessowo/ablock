import requests
from bs4 import BeautifulSoup
import json
import time


def scrape_page(url):
    response = requests.get(url)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, 'html.parser')
    results = soup.find_all('p')
    return [result.get_text(strip=True) for result in results]


base_urls = {
    "https://www.bbc.com/news": "?page=",
    "https://www.bbc.com/news/world": "?page=",
    "https://www.bbc.com/news/technology": "?page=",
    "https://www.bbc.com/news/science_and_environment": "?page=",
    "https://www.cnn.com/world": "/page/",
    "https://www.cnn.com/tech": "/page/",
    "https://www.theguardian.com/international": "?page=",
    "https://www.theguardian.com/uk/technology": "?page=",
    "https://www.nytimes.com/section/world": "?page=",
    "https://www.nytimes.com/section/technology": "?page="
}


all_results = []
target_count = 5000
current_count = 0
max_pages_per_url = 40

for base_url, page_param in base_urls.items():
    for page in range(1, max_pages_per_url + 1):
        url = f"{base_url}{page_param}{page}"
        print(f"Scraping URL: {url}")
        results = scrape_page(url)
        all_results.extend(results)
        current_count += len(results)
        print(f"Current count: {current_count}")
        time.sleep(1)

        if current_count >= target_count:
            break
    if current_count >= target_count:
        break


all_results = all_results[:target_count]


data = {
    "notPropaganda": all_results
}


with open('not_propaganda5000.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print(f"Scraped {len(all_results)} items and saved to not_propaganda5000.json")

