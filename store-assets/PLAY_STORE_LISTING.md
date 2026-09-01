# Play Store listing content

## Short description (max 80 chars — this is 77)

```
Order wine, whiskey & spirits online in Rwanda — fast delivery, real rewards.
```

## Full description (max 4000 chars — this is ~1080)

```
Wine & Liquor Joint brings a wide selection of wine, whiskey, cognac, vodka, gin, rum, tequila, champagne, brandy, and liqueurs straight to your door across Rwanda.

You must be of legal drinking age to use this app. Please drink responsibly.

WHAT YOU CAN DO
• Browse hundreds of bottles across Wine, Whiskey, Cognac, Vodka, Gin, Rum, Tequila, Champagne, Brandy, and Liqueur
• Search and filter by category, price, and region
• Save favorites to your wishlist
• Track your order from confirmation to delivery
• Earn loyalty rewards — free delivery and discount coupons after every few orders
• Pay by card or mobile money, with split-payment and pay-on-pickup options
• See store-run promotions and seasonal offers
• Chat directly with our team for help with your order

WHY WINE & LIQUOR JOINT
We work with trusted importers and retailers to bring authenticated bottles — from everyday favorites to rare and limited releases — to customers across Rwanda, with fast, careful delivery.

Questions or need help with an order? Reach us anytime by phone or WhatsApp at +250 783 523 034.
```

## Feature graphic

`feature-graphic.png` in this folder — 1024×500, matches the site's brand exactly.

## Privacy policy URL

`https://liquor-store-4l2v.vercel.app/privacy` — live now, linked from the site footer too.

## Content rating questionnaire — how to answer it

Play Console runs this as an IARC questionnaire when you create the listing. Answer honestly (misrepresenting it risks a takedown later, not just a rejection now):

- **"Does your app reference or depict alcohol, tobacco, or drugs?"** → Yes, alcohol.
- **"Does your app allow the purchase of alcohol?"** → Yes.
- **"Does your app include user-to-user communication?"** → The in-app chat is customer ↔ your support team only, not user-to-user — answer accordingly (typically "No" for peer chat, since there's no way for two customers to message each other).
- **"Does your app share the user's physical location?"** → The delivery address is entered manually as text, not live/background GPS tracking — answer based on that distinction; don't overstate it as location tracking if it isn't.
- **"Digital purchases"** → This sells physical goods delivered in person, not digital content, so it's exempt from Google Play Billing requirements — just answer the purchase questions based on real money changing hands for physical goods.

Expect the alcohol answer to trigger Google's **Restricted Content policy for alcohol**. In practice this usually means:
- Your listing may only be available in countries where you're legally licensed to sell/deliver alcohol (set this under Play Console → Store presence → Countries/regions — don't leave it as "all countries").
- Google may ask for proof of licensing to sell alcohol in Rwanda during review.

## ⚠️ Found while checking this: no age-gate in the app itself

I checked the app's screens (`src/`) and there's currently **no age-verification step anywhere** — no "confirm you're of legal drinking age" screen before someone can browse or order. For an app whose core function is alcohol sales, Google's reviewers commonly expect to see this as an actual in-app gate, not just a line in the store description. This is a real risk to approval, separate from the listing content above. Worth doing before you submit — say the word and I'll build it.

## Not yet done — needs a real device/emulator

Screenshots (min. 2 phone screenshots) couldn't be produced in this environment — there's no Android emulator or connected device here to capture real app screens, and Play Store requires actual screenshots of the running app (not mockups). Easiest path: run `eas build --platform android --profile preview` (already configured), install the resulting APK on an Android phone, and screenshot the home screen, a product page, cart/checkout, and order tracking.
