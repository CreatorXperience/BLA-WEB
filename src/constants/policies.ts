export interface PolicySection {
  heading: string;
  body: string[];
}

export const POLICIES: Record<string, { title: string; updated: string; sections: PolicySection[] }> = {
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: January 2026",
    sections: [
      {
        heading: "What we collect",
        body: [
          "We collect information you provide directly — your name, email address, phone number, shipping and billing addresses, and order history.",
          "We also collect limited technical data automatically: IP address, browser type, device information, and how you interact with the site.",
        ],
      },
      {
        heading: "How we use your information",
        body: [
          "We use your information to process orders, deliver products, send order updates, provide customer support, and improve your shopping experience.",
          "With your consent, we may send occasional email about new drops and collections. You can unsubscribe at any time.",
        ],
      },
      {
        heading: "Payments",
        body: [
          "Payment details are processed by our payment partners (Paystack and Flutterwave). We never store your full card number on our servers.",
        ],
      },
      {
        heading: "Sharing",
        body: [
          "We do not sell your personal data. We share information only with service providers who help operate the store, under strict confidentiality agreements.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You may access, correct, or request deletion of your personal data at any time by contacting us. We respond to all requests within 30 days.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    updated: "Last updated: January 2026",
    sections: [
      {
        heading: "Acceptance",
        body: [
          "By using this website you agree to these terms. If you do not agree, please do not use the site.",
        ],
      },
      {
        heading: "Orders & pricing",
        body: [
          "All prices are listed in the applicable currency and include applicable taxes unless stated otherwise. We reserve the right to refuse or cancel any order at our discretion.",
          "Products are subject to availability. In the rare case an item is unavailable, we will contact you to offer an alternative or a full refund.",
        ],
      },
      {
        heading: "Accuracy",
        body: [
          "We make every effort to display product colours and details accurately, but we cannot guarantee that your screen renders them exactly as in person.",
        ],
      },
      {
        heading: "Intellectual property",
        body: [
          "All content on this site — designs, imagery, text and branding — is the property of BLA and may not be reproduced without written permission.",
        ],
      },
      {
        heading: "Limitation of liability",
        body: [
          "To the fullest extent permitted by law, BLA is not liable for indirect or consequential damages arising from your use of the site.",
        ],
      },
    ],
  },
  shipping: {
    title: "Shipping & Returns",
    updated: "Last updated: January 2026",
    sections: [
      {
        heading: "Shipping",
        body: [
          "Orders are dispatched within 24 hours of confirmation. Domestic delivery typically takes 1–5 business days; international 5–12 business days.",
          "Free standard domestic shipping on orders above the threshold shown at checkout. You will receive a tracking number once your order ships.",
        ],
      },
      {
        heading: "Returns",
        body: [
          "Items may be returned within 14 days of delivery in original condition with tags attached. Final-sale and personalised items cannot be returned.",
          "To start a return, contact us with your order number. Return shipping costs are the customer's responsibility unless the item arrived damaged or incorrect.",
        ],
      },
      {
        heading: "Refunds",
        body: [
          "Refunds are issued to your original payment method within 5–10 business days of receiving the returned item. Shipping fees are non-refundable.",
        ],
      },
      {
        heading: "Damaged or incorrect items",
        body: [
          "If your order arrives damaged or incorrect, contact us within 48 hours with photos and we will arrange a replacement or refund at no cost to you.",
        ],
      },
    ],
  },
};

export function getPolicy(slug: string) {
  return POLICIES[slug] ?? null;
}
