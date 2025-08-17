exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable('categories', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('color').defaultTo('#8B5CF6');
      table.text('description');
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.timestamps(true, true);
      table.unique(['name', 'user_id']);
    }),
    
    knex.schema.table('links', function(table) {
      table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
      table.text('tags'); // JSON string of tags
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('links', function(table) {
      table.dropColumn('category_id');
      table.dropColumn('tags');
    }),
    knex.schema.dropTable('categories')
  ]);
};
