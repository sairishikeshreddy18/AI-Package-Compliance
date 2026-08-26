import re


def extract_product_data(ocr_text):

    data = {
        "product_name": None,
        "mrp": None,
        "net_quantity": None,
        "manufacturer": None,
        "packer": None,
        "importer": None,
        "consumer_care": None
    }

    # Clean OCR text
    text = ocr_text.replace("\r", "\n")

    lines = [
        line.strip()
        for line in text.split("\n")
        if line.strip()
    ]

    # Extract MRP
    mrp_pattern = r"M\.R\.P\s*Rs\.?\s*(\d+(?:\.\d{1,2})?)"

    mrp_match = re.search(
        mrp_pattern,
        text,
        re.IGNORECASE
    )

    if mrp_match:
        data["mrp"] = "₹" + mrp_match.group(1)

    # Extract Net Quantity
    quantity_pattern = (
        r"(?:NET\s*)?"
        r"(?:QTY|QUANTITY|WT|WEIGHT)"
        r"\s*[:\-]?\s*"
        r"(\d+(?:\.\d+)?)"
        r"\s*"
        r"(kg|g|gm|mg|l|ml)"
    )

    quantity_match = re.search(
        quantity_pattern,
        text,
        re.IGNORECASE
    )

    if quantity_match:
        value = quantity_match.group(1)
        unit = quantity_match.group(2)
        data["net_quantity"] = f"{value} {unit}"

    # Extract Manufacturer
    manufacturer_pattern = (
        r"(?:Manufactured\s+by|"
        r"Mfd\.?\s*by|"
        r"Manufacturer)"
        r"\s*[:\-]?\s*(.+)"
    )

    manufacturer_match = re.search(
        manufacturer_pattern,
        text,
        re.IGNORECASE
    )

    if manufacturer_match:
        data["manufacturer"] = manufacturer_match.group(1).strip()

    # Extract Packer
    packer_pattern = (
        r"(?:Packed\s+by|Packer)"
        r"\s*[:\-]?\s*(.+)"
    )

    packer_match = re.search(
        packer_pattern,
        text,
        re.IGNORECASE
    )

    if packer_match:
        data["packer"] = packer_match.group(1).strip()

    # Extract Importer
    importer_pattern = (
        r"(?:Imported\s+by|Importer)"
        r"\s*[:\-]?\s*(.+)"
    )

    importer_match = re.search(
        importer_pattern,
        text,
        re.IGNORECASE
    )

    if importer_match:
        data["importer"] = importer_match.group(1).strip()

    # Extract Consumer Care
    consumer_pattern = (
        r"(?:Consumer\s+Care|"
        r"Customer\s+Care|"
        r"Customer\s+Service)"
        r"\s*[:\-]?\s*(.+)"
    )

    consumer_match = re.search(
        consumer_pattern,
        text,
        re.IGNORECASE
    )

    if consumer_match:
        data["consumer_care"] = consumer_match.group(1).strip()

    # Product Name
    if lines:
        data["product_name"] = lines[0]

    return data


# Test
if __name__ == "__main__":

    sample_ocr = """
    PARLE-G BISCUITS
    M.R.P Rs. 50
    Net Qty 200g
    Manufactured by ABC Foods Pvt Ltd
    Packed by XYZ Packers
    Imported by XYZ Imports
    Consumer Care: 1800-123-456
    """

import json

result = extract_product_data(sample_ocr)

print(json.dumps(result, indent=4, ensure_ascii=False))