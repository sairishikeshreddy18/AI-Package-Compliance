REQUIRED_FIELDS = [
    "product_name",
    "mrp",
    "net_quantity",
    "manufacturer",
]


def check_compliance(product_data):
    violations = []
    checked_fields = 0
    passed_fields = 0

    for field in REQUIRED_FIELDS:
        checked_fields += 1

        value = product_data.get(field)

        if value is None or str(value).strip() == "":
            violations.append({
                "field": field,
                "status": "Missing",
                "message": f"{field.replace('_', ' ').title()} is missing"
            })
        else:
            passed_fields += 1

    # Calculate compliance score
    score = round((passed_fields / checked_fields) * 100)

    if score == 100:
        overall_status = "Compliant"
    elif score >= 50:
        overall_status = "Partially Compliant"
    else:
        overall_status = "Non-Compliant"

    return {
        "overallStatus": overall_status,
        "score": score,
        "violations": violations,
    }
