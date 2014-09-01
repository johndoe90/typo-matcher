
	/*var languages = ['german', 'english', 'spanish', 'italian', 'chinese', 'czech'];

	let interval = setInterval(function() {
		for ( let i = 0; i < 20; i++ ){
			matcher.add({
				date: new Date().getTime(),
				id: '' + Math.floor(Math.random() * 999999999),
				strength: Math.floor(Math.random() * 1000) + 1801,
				languages: [languages[Math.floor(Math.random() * 6)], languages[Math.floor(Math.random() * 6)]],
				criteria: {
					strength: [
						{
							optional: false,
							_test: 'return Math.abs(arguments[0] - this.strength) < 25 ? 1 : 0;',
							test: function() {
								return Math.abs(arguments[0] - this.strength) < 25 ? 1 : 0; 
							}
						}
					],

					languages: [
						{
							optional: false,
							_test: 'var matches = 0; for ( var i = 0; i < this.languages.length; i++ ) { if (arguments[0].indexOf(this.languages[i]) !== -1) { matches++; }} return matches * 25;',
							test: function() {
								let matches = 0;
								for ( let i = 0; i < this.languages.length; i++ ) {
									if ( arguments[0].indexOf(this.languages[i]) !== -1 ) {
										matches++;
									}
								}

								return matches * 25;
							}
						}
					]
				}
			});
		}
	}, 0);

	process.once('SIGINT', function(){
		clearInterval(interval);
	});*/
