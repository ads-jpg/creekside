# Snackify: Abandoned Checkout flow (2026)

A two-email flow for shoppers who start checkout but don't place an order.

```
Started Checkout (Shopify)
        │
   Wait 1 hour
        │
   Email 1: "Your snacks are still waiting"   abandoned-checkout.html
        │
   Wait 1 day
        │
   Email 2: "Still thinking it over?"          abandoned-checkout-reminder.html
        │
       End
```

## Setup

| Setting | Value |
| --- | --- |
| Flow name | `Snackify - Abandoned Checkout - 2026` |
| Trigger | Metric: **Started Checkout** (Shopify integration). Both emails depend on this event's `line_items` and `responsive_checkout_url`. |
| Flow filter | **Placed Order zero times since starting this flow**. People who buy are dropped before the next email. |
| Smart Sending | On for both emails |
| UTM tracking | On (`utm_campaign` = email name) |
| Initial status | **Draft/Manual** until previews are checked (see launch checklist) |

## Email 1: sent 1 hour after checkout starts

- **Template:** `Snackify - Abandoned Checkout 1 - Your snacks are waiting`
- **Subject:** Psst… you forgot something
- **Preview text:** We saved your cart. Finish checking out before your favorites sell out.
- **A/B subject alternates:** "Your snacks are still waiting 🍪" / "{{ person.first_name|default:'Hey' }}, your cart is saved"
- **Content:** green hero, dynamic cart items and subtotal, "Finish My Order" button, reassurance strip.

## Email 2: sent 1 day after Email 1

- **Template:** `Snackify - Abandoned Checkout 2 - Reminder`
- **Subject:** Still thinking it over?
- **Preview text:** Your cart is still saved, but we can't hold it forever.
- **A/B subject alternates:** "Last call on your snacks" / "Your cart misses you, {{ person.first_name|default:'friend' }}"
- **Content:** lime hero, the same dynamic cart block, "Complete My Order" button, and a "Questions before you check out?" reply prompt.

Neither email offers a discount. To add an incentive, put a discount code or a Shopify dynamic coupon in Email 2 only, so shoppers don't learn to abandon checkout to get a code.

## Launch checklist

1. Run `push_to_klaviyo.py` to create both templates, or send them in through the Klaviyo connector.
2. Build the flow above and pick the matching template for each email.
3. Preview both emails against a profile with a real Started Checkout event. Check product images, the variant line, the subtotal and the checkout link.
4. Send test emails to Gmail, Apple Mail and Outlook.
5. **Turn the existing abandoned checkout flow off at the same moment** you set this one to Live, so nobody gets both.
