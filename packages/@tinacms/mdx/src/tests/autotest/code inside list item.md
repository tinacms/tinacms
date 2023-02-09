1.  Create a backup of your .htaccess file, located in the root of your Web server.
2.  Edit the .htaccess file and add the following code. Don’t forget to modify the feed’s URL with your own feed’s URL.

        # temp redirect wordpress content feeds to feedburner
        <IfModule mod_rewrite.c>
         RewriteEngine on
         RewriteCond %{HTTP_USER_AGENT} !FeedBurner    [NC]
         RewriteCond %{HTTP_USER_AGENT} !FeedValidator [NC]
         RewriteRule ^feed/?([_0-9a-z-]+)?/?$ https://feeds.feedburner.com/wprecipes [R=302,NC,L]
        </IfModule>

3.  Save the file. You’re done!
