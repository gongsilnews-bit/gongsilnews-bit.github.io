require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Error: SUPABASE_URL or SUPABASE_KEY is missing in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchIndices() {
    try {
        console.log("Fetching KOSPI / KOSDAQ from Naver Mobile API...");
        const kospiRes = await fetch('https://m.stock.naver.com/api/index/KOSPI/basic');
        const kospiData = await kospiRes.json();
        
        const kosdaqRes = await fetch('https://m.stock.naver.com/api/index/KOSDAQ/basic');
        const kosdaqData = await kosdaqRes.json();

        // format
        const kospiV = kospiData.closePrice;
        let p = parseFloat(kospiData.compareToPreviousClosePrice);
        let r = parseFloat(kospiData.fluctuationsRatio);
        let kospiIcon = p > 0 ? 'up' : (p < 0 ? 'down' : 'flat');
        let kospiArrow = p > 0 ? '▲' : (p < 0 ? '▼' : '-');
        const kospiC = `${kospiArrow} ${Math.abs(r)}%`;

        const kosdaqV = kosdaqData.closePrice;
        let cp = parseFloat(kosdaqData.compareToPreviousClosePrice);
        let cr = parseFloat(kosdaqData.fluctuationsRatio);
        let kosdaqIcon = cp > 0 ? 'up' : (cp < 0 ? 'down' : 'flat');
        let kosdaqArrow = cp > 0 ? '▲' : (cp < 0 ? '▼' : '-');
        const kosdaqC = `${kosdaqArrow} ${Math.abs(cr)}%`;

        // Mock data for Real Estate
        // Because real estate indexes are not simply available via open json without auth,
        // we use sensible realistic dummy data that you can later substitute heavily.
        const aptSaleV = "102.4";
        const aptSaleC = "▲ 0.15%";
        const aptSaleIcon = "up";

        const aptRentV = "105.2";
        const aptRentC = "▲ 0.28%";
        const aptRentIcon = "up";

        const rows = [
            {
                id: 'KOSPI',
                index_name: '코스피',
                index_value: kospiV,
                change_rate: kospiC,
                status_icon: kospiIcon,
                updated_at: new Date().toISOString()
            },
            {
                id: 'KOSDAQ',
                index_name: '코스닥',
                index_value: kosdaqV,
                change_rate: kosdaqC,
                status_icon: kosdaqIcon,
                updated_at: new Date().toISOString()
            },
            {
                id: 'APT_SALE',
                index_name: '매매가격지수 (서울)',
                index_value: aptSaleV,
                change_rate: aptSaleC,
                status_icon: aptSaleIcon,
                updated_at: new Date().toISOString()
            },
            {
                id: 'APT_RENT',
                index_name: '전세가격지수 (서울)',
                index_value: aptRentV,
                change_rate: aptRentC,
                status_icon: aptRentIcon,
                updated_at: new Date().toISOString()
            }
        ];

        console.log("Upserting into Supabase market_indices...");
        const { data, error } = await supabase
            .from('market_indices')
            .upsert(rows);

        if (error) {
            console.error("Supabase Error:", error);
        } else {
            console.log("Successfully updated indices!");
        }

    } catch (e) {
        console.error("Error fetching indices:", e);
    }
}

fetchIndices();
