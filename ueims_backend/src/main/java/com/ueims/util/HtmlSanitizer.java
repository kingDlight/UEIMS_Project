package com.ueims.util;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

public final class HtmlSanitizer {
    private HtmlSanitizer() {}

    public static String sanitize(String html) {
        if (html == null) return null;
        // Use relaxed safelist to allow common formatting (b, i, ul, ol, a, img, etc.).
        return Jsoup.clean(html, Safelist.relaxed());
    }
}
