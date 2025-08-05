document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の参照を取得 ---
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchResultsContainer = document.getElementById('search-results');

    /**
     * フォームの送信イベントを処理し、Bungie.net APIを呼び出します。
     * @param {Event} event - フォームの送信イベント
     */
    const handleSearch = async (event) => {
        event.preventDefault(); // フォームのデフォルトの送信動作（ページ再読み込み）をキャンセル

        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            searchResultsContainer.innerHTML = '<p>検索キーワードを入力してください。</p>';
            return;
        }

        // 設定ファイルが読み込まれているか、APIキーが設定されているかチェック
        if (typeof window.BUNGIE_API_CONFIG === 'undefined' || !window.BUNGIE_API_CONFIG.API_KEY) {
            alert('警告: API設定ファイル(js/config.js)が読み込まれていないか、APIキーが設定されていません。');
            searchResultsContainer.innerHTML = '<p style="color: red;">API設定が不完全です。`js/config.js`を確認してください。</p>';
            return;
        }

        // APIキーがデフォルト値のままかチェック
        if (window.BUNGIE_API_CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
            alert('警告: Bungie.net APIキーが設定されていません。js/config.js ファイルを編集してください。');
            searchResultsContainer.innerHTML = '<p style="color: red;">APIキーが設定されていません。アプリケーションを正しく動作させるには、Bungie.netでAPIキーを取得し、`js/config.js`ファイルに設定する必要があります。</p>';
            return;
        }

        // 検索中に「検索中...」というメッセージを表示
        searchResultsContainer.innerHTML = '<p>検索中...</p>';

        try {
            // Bungie.net APIのエンドポイントを構築 (設定ファイルの値を使用)
            // DestinyInventoryItemDefinition は武器、防具、パークなど様々なアイテムを含みます
            const endpoint = `${window.BUNGIE_API_CONFIG.API_BASE_URL}/Destiny2/Armory/Search/DestinyInventoryItemDefinition/${encodeURIComponent(searchTerm)}/`;

            // fetch APIを使ってリクエストを送信
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'X-API-Key': window.BUNGIE_API_CONFIG.API_KEY
                }
            });

            // HTTPステータスコードが200番台でない場合はエラーを投げる
            if (!response.ok) {
                throw new Error(`APIリクエストに失敗しました。ステータス: ${response.status}`);
            }

            const data = await response.json();

            // Bungie.net APIが返す内部的なエラーコードをチェック (1は成功)
            if (data.ErrorCode !== 1) {
                throw new Error(`Bungie.net APIエラー: ${data.Message}`);
            }

            // 取得したデータをコンソールに出力します
            console.log('APIからのレスポンス:', data);

            // TODO: ここで結果を画面に描画する処理を呼び出す
            const results = data.Response.results.results;
            searchResultsContainer.innerHTML = results && results.length > 0
                ? `<p>${results.length}件のアイテムが見つかりました。詳細はデベロッパーコンソールを確認してください。</p>`
                : '<p>検索結果が見つかりませんでした。</p>';

        } catch (error) {
            console.error('検索処理中にエラーが発生しました:', error);
            searchResultsContainer.innerHTML = `<p style="color: red;">エラーが発生しました: ${error.message}</p>`;
        }
    };

    // --- イベントリスナーの設定 ---
    // フォームが送信されたときに handleSearch 関数を実行する
    searchForm.addEventListener('submit', handleSearch);
});