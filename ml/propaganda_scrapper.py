import json
import time
from selenium import webdriver
from bs4 import BeautifulSoup

# Initialize the WebDriver (make sure you have the appropriate driver installed and in your PATH)
driver = webdriver.Chrome()  # Or use `webdriver.Firefox()` if you prefer Firefox

# Function to scrape a single page
def scrape_page(driver, url):
    driver.get(url)
    time.sleep(3)  # Wait for the JavaScript to load the content
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    results = soup.select("div.resultDescription")
    return [result.get_text(strip=True) for result in results]

# Base URL and parameters
base_url = "https://securingdemocracy.gmfus.org/social-data-search/"
params = "?q=*&account_country-Russia=true&product=(product eq 'Hamilton')&start-date=2023-01-01&end-date=2024-02-13&page="

# Loop through multiple pages and collect results
all_results = []
target_count = 1000# The target number of examples
page = 1

while len(all_results) < target_count:
    url = base_url + params + str(page)
    print(f"Scraping page {page}")
    results = scrape_page(driver, url)
    all_results.extend(results)
    page += 1
    time.sleep(1)  # Be polite and avoid overwhelming the server

    # Stop if there are no more results
    if not results:
        print("No more results found, stopping.")
        break

# Limit to the target count if more than necessary were collected
all_results = all_results[:target_count]

# Prepare the data to be saved in JSON format
data = {
    "russianPropaganda": all_results
}

# Save the data to a JSON file
with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print(f"Scraped {len(all_results)} items and saved to data.json")

# Close the WebDriver
driver.quit()

