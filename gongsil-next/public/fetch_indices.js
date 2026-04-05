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
            { id: 'APT_SALE_NAT', index_name: '매매가격지수 (전국)', index_value: '99.8', change_rate: '▼ 0.05%', status_icon: 'down', updated_at: new Date().toISOString() },
            { id: 'APT_SALE_MET', index_name: '매매가격지수 (수도권)', index_value: '101.5', change_rate: '▲ 0.10%', status_icon: 'up', updated_at: new Date().toISOString() },
            { id: 'APT_SALE_SEOUL', index_name: '매매가격지수 (서울)', index_value: aptSaleV, change_rate: aptSaleC, status_icon: aptSaleIcon, updated_at: new Date().toISOString() },
            { id: 'APT_SALE_BUSAN', index_name: '매매가격지수 (부산)', index_value: '95.2', change_rate: '▼ 0.12%', status_icon: 'down', updated_at: new Date().toISOString() },
            { id: 'APT_SALE_DAEGU', index_name: '매매가격지수 (대구)', index_value: '90.1', change_rate: '▼ 0.35%', status_icon: 'down', updated_at: new Date().toISOString() },
            { id: 'APT_SALE_INCHEON',index_name: '매매가격지수 (인천)', index_value: '100.2', change_rate: '▲ 0.08%', status_icon: 'up', updated_at: new Date().toISOString() },
            { id: 'APT_SALE_GWANGJU',index_name: '매매가격지수 (광주)', index_value: '98.5', change_rate: '▼ 0.02%', status_icon: 'down', updated_at: new Date().toISOString() },
            { id: 'APT_SALE_DAEJEON',index_name: '매매가격지수 (대전)', index_value: '97.4', change_rate: '▼ 0.15%', status_icon: 'down', updated_at: new Date().toISOString() },
            { id: 'APT_RENT_NAT', index_name: '전세가격지수 (전국)', index_value: '98.1', change_rate: '▼ 0.01%', status_icon: 'down', updated_at: new Date().toISOString() },
            { id: 'APT_RENT_MET', index_name: '전세가격지수 (수도권)', index_value: '103.2', change_rate: '▲ 0.18%', status_icon: 'up', updated_at: new Date().toISOString() },
            { id: 'APT_RENT_SEOUL', index_name: '전세가격지수 (서울)', index_value: aptRentV, change_rate: aptRentC, status_icon: aptRentIcon, updated_at: new Date().toISOString() },
            { id: 'APT_RENT_BUSAN', index_name: '전세가격지수 (부산)', index_value: '96.5', change_rate: '▼ 0.08%', status_icon: 'down', updated_at: new Date().toISOString() },
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
