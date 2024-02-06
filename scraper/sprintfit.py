import requests
from bs4 import BeautifulSoup
import sys
import os

def scrape_products(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')

        products = soup.find_all('div', class_='product')

        product_data = []

        for product in products:
            # Find the image URL
            image_tag = product.find('img', class_='img-responsive')
            image_url = image_tag['src'] if image_tag else 'No Image Found'

            # Find the product link
            link_tag = product.find('a', class_='product-content')
            product_link = 'https://www.sprintfit.co.nz/' + link_tag['href'] if link_tag and link_tag.has_attr('href') else 'No Link Found'

            # Find the product name
            name_tag = product.find('div', class_='name')
            brand = name_tag.find('strong').text.strip() if name_tag.find('strong') else ''
            product_name = name_tag.contents[-1].strip() if name_tag else ''
            full_name = f"{brand} {product_name}".strip()

            # Find the lowest price (special price if available, else normal price)
            price_tag = product.find('span', class_='price special')
            if not price_tag:  # If no special price is found, use the regular price
                price_tag = product.find('span', class_='price')
            if price_tag:
                price_text = price_tag.get_text(" ", strip=True)
                prices = [p.strip() for p in price_text.split() if p.startswith('$')]
                lowest_price = min(prices, key=lambda x: float(x.strip('$').replace(',', '')))[1:] if prices else 'No Price Found'
            else:
                lowest_price = 'No Price Found'

            product_data.append({
                'companyid': 3,  
                'productname': full_name,
                'price': lowest_price,
                'image': image_url,
                'link': product_link
            })

        
        api_key = os.getenv('API_KEY')
        headers['X-API-KEY'] = api_key

        response = requests.put("https://api.suppsaver.net/api/products/update-price", headers=headers, json=product_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")

        return product_data
    else:
        print("Failed to retrieve the webpage")
        return []

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <URL>")
        sys.exit(1)
    
    url = sys.argv[1]
    products = scrape_products(url)
    for product in products:
        print(product)

