<?php
// Globals and constants
global $error, $operations, $actions;
$error = '';
$operations = array(
  'Multiplication',
  'Addition',
  'Division',
  'Subtraction',
  'Subtraction, positive result'
  );
$actions = array(
  'online'  => 'Online timed test',
  'offline' => 'Printable worksheet',
  );

// Validate inputs
//
// action (test type: online, offline, welcome, error)
if (isset($_POST['action']))
{
  $action = $_POST['action'];
}
else
{
  $action = 'welcome';
}
if (!in_array($action, array_keys($actions)) && $action != 'welcome')
{
  $action = 'error';
  error_exit('Invalid test type!'); // Exits
}
// Don't need any variables for welcome page
if ($action != 'welcome')
{
  // Rows and columns
  $rows = htmlspecialchars($_POST['rows']);
  if ($rows <= 0)
  {
    error_exit('Invalid number of rows.');
  }
  $columns = htmlspecialchars($_POST['columns']);
  if ($columns <= 0)
  {
    error_exit('Invalid number of columns.');
  }
  // Math operation to use
  $operation = htmlspecialchars($_POST['operation']);
  if (!in_array($operation, $operations))
  {
    error_exit('Invalid operation.');
  }
  // 'Top' operand list
  $top_list = array();
  if (isset($_POST['top_list']))
  {
    $temp_list = explode(',', htmlspecialchars($_POST['top_list']));
    foreach($temp_list as $val)
    {
      if (is_numeric($val))
      {
        $top_list[] = $val;
      }
    }
  }
  if (count($top_list) == 0)
  {
    if (!@isset($_POST['top_min']))
    {
      error_exit('No min or range for top/quotient!');
    }
    if (!@isset($_POST['top_max']))
    {
      error_exit('No max or range for top/quotient!');
    }
    $top_min = @htmlspecialchars($_POST['top_min']);
    $top_max = @htmlspecialchars($_POST['top_max']);
    if (!is_numeric($top_min) or !is_numeric($top_max))
    {
      error_exit('Only numeric values allowed for top range!');
    }
    // Create a top-list
    $top_list = array();
    if ($top_min > $top_max)
    {
      $temp = $top_max;
      $top_max = $top_min;
      $top_min = $temp;
    }
    for ($t = $top_min; $t <= $top_max; $t++)
    {
      $top_list[] = $t;
    }
  }
  // 'Bottom' operand list
  $bot_list = array();
  if (@isset($_POST['bot_list']))
  {
    $temp_list = explode(',', htmlspecialchars($_POST['bot_list']));
    foreach($temp_list as $val)
    {
      if (is_numeric($val))
      {
        $bot_list[] = $val;
      }
    }
  }
  if (count($bot_list) == 0)
  {
    if (!@isset($_POST['bot_min']))
    {
      error_exit('No min or range for bottom/divisor!');
    }
    if (!@isset($_POST['bot_max']))
    {
      error_exit('No max or range for bottom/divisor!');
    }
    $bot_min = @htmlspecialchars($_POST['bot_min']);
    $bot_max = @htmlspecialchars($_POST['bot_max']);
    if (!is_numeric($bot_min) or !is_numeric($bot_max))
    {
      error_exit('Only numeric values allowed for bottom range!');
    }
    // Create a bottom-list
    $bot_list = array();
    if ($bot_min > $bot_max)
    {
      $temp = $bot_max;
      $bot_max = $bot_min;
      $bot_min = $temp;
    }
    for ($b = $bot_min; $b <= $bot_max; $b++)
    {
      $bot_list[] = $b;
    }
  }
  // Tournament sheet number
  srand(); // In case I want to use a key later
}

// If we've gotten this far, there are no errors.  All the inputs were good,
// and we're ready to present a web page!
print("<html>\n");
print_head($action);
if ($action == 'online' || $action == 'offline')
{
  print_sheet($operation, $columns, $rows, $top_list, $bot_list, $action);
}
else
{
  print_welcome();
}
print("</html>\n");
return;

// Writes the contents of the <head> tag for front page, online,
// or offline worksheets
function print_head($action='offline')
{
  print("<head>\n");
  print("<title>Online Timed Test by Judebert</title>\n");
  // Worksheets use bold text in table cells
  if ($action == 'offline' || $action == 'online')
  {
    print <<<EOS
  <style>
    td {
      font-weight: bold;
    }
    #attribution {
      width: 100%;
      font-size: small;
    }
    #attribution td {
      text-align: center;
      width : 33%;
    }
  </style>
EOS;
  }
  // Only online requires Javascript
  if ($action == 'online')
  {
    print <<<EOS
  <script type="text/javascript">
  <!--
    var secs = 0;
    var ticker = null;
    var timer = null;
    function init() {
      timer = document.getElementById('timer');
      ticker = setTimeout('tick()', 1000);
      inputs = document.getElementsByTagName('input');
      for (var n = 0;  n < inputs.length; n++) {
        i = inputs[n];
        if ((i.type == 'text') && (i.className == 'ans')) {
          i.onkeypress = nextfield;
        }
      }
      forms = document.getElementsByTagName('form');
      for (n = 0; n < forms.length; n++) {
        f = forms[n];
        if (f.className == 'check') {
          f.onsubmit = check;
        }
      }
      document.getElementById('0').focus();
    }
    function tick() {
      secs = secs + 1;
      //document.getElementById('timer').innerHTML = secs+" secs";
      timer.innerHTML = secs+" secs";
      if (secs > 30) {

      }
      ticker = setTimeout('tick()', 1000);
    }
    function nextfield(evt) {
      evt = (evt)?evt:event;
      var charCode = (evt.charCode)?evt.charCode:((evt.which)?evt.which:evt.keyCode);
      if (charCode == 13 || charCode == 3) {
        var target = (evt.target)?evt.target:evt.srcElement;
        next = Number(target.id) + 1;
        field = document.getElementById(next);
        while (field.disabled == true) {
          next++;
          field = document.getElementById(next);
        }
        field.focus();
        field.select();
        return false;
      }
      return true;
    }
    function check() {
      // I'm reduced to this ridiculous substringing because IE can't
      // tell its ass...igned id from its name.  Among other things.
      last = Number(this.name.substring(1));
      wrong = 0;
      toFocus = null;
      for (f=0;f<=last;f++) {
        field = document.getElementById(f);
        if (field.name.substring(1) != field.value) {
          // This one's wrong
          field.style.border = '2px solid red';
          field.value = field.value+'!';
          wrong++;
          if (toFocus == null) {
            toFocus = field;
            toScroll = f;
          }
        } else {
          field.disabled = true;
        }
      }
      if (wrong == 0) {
        clearTimeout(ticker);
        alert(secs + ' seconds! ' + '\\n' + 'Good job!');
      } else {
        document.location.href = '#p' + toScroll;
        toFocus.focus();
        toFocus.select();
      }

      return false;
    }
    window.onload=init;
  //-->
  </script>
EOS;
  }
  print("</head>");
}

/**
 * Write a worksheet, suitable for offline or online timed testing
 */
function print_sheet($operation='Multiplication', $columns, $rows, $top_list, $bot_list, $action='offline')
{
  // Permute all the possible problems
  //
  $candidates = array();
  foreach ($top_list as $top)
  {
    foreach ($bot_list as $bot)
    {
      switch ($operation)
      {
      case 'Subtraction, positive result':
        $sum = $top + $bot;
        $candidates[] = array($sum => $bot);
        break;
      case 'Division':
        $product = $top * $bot;
        $candidates[] = array($product => $bot);
        break;
      case 'Multiplication':
      case 'Addition':
      case 'Subtraction':
      default:
        $candidates[] = array($top => $bot);
        break;
      }
    }
  }
  shuffle($candidates);

  // Pick the problems.  Use each candidate before repeating if necessary.
  //
  $len = count($candidates);
  if ($len <= 0) die('No problems to choose from!');
  $num = 0;
  $problems = array();
  for ($c = 0; $c < $columns; $c++)
  {
    for ($r = 0; $r < $rows; $r++)
    {
      if ($num >= $len)
      {
        // Reshuffle the candidates
        $num = 0;
        shuffle($candidates);
      }
      $problems[] = $candidates[$num++];
    }
  }

  // Format the problems into a worksheet table
  echo "<body>\n";
  echo "<!-- Ensures a new page after problems on printout -->\n";
  echo "<div style='page-break-after:always;'>\n";

  // Online timed testing requires a form, so there's a place for inputs
  if ($action == 'online')
  {
    // Name of form is ID of last problem
    $num = ($columns * $rows) - 1;
    echo "<form action='' name='n$num' class='check' autocomplete='off'>\n";
  }

  // Determine size of columns
  $colpercent = 100 / $columns;

  // Title
  if (isset($_POST['page_title']))
  {
    $title = htmlspecialchars($_POST['page_title']);
    echo "<center><H2>$title</H2></center>\n";
  }

  //Timer
  if ($action == 'online')
  {
    echo "<center><h3 id='timer'>0 secs</h3></center>\n";
  }

  // Problems
  echo "<table width='100%'>\n";
  // There are exactly enough problems, so nested loops will work easily
  reset($problems);
  $prob = current($problems);
  $field = 0;
  for ($r = 0; $r < $rows; $r++)
  {
    echo "<tr>\n";
    for ($c = 0; $c < $columns; $c++)
    {
      $bot = current($prob);
      $top = key($prob);
      echo "  <td width='$colpercent%'><a name='p$field'></a><table>\n";
      echo "    <tr><td align='right'>$top</td></tr>\n";
      switch ($operation)
      {
      case 'Multiplication':
        echo "    <tr><td align='right'>&#215; $bot</td></tr>\n";
        $ans = $top * $bot;
        break;
      case 'Division':
        echo "    <tr><td align='right'>&#247; $bot</td></tr>\n";
        $ans = $top / $bot;
        break;
      case 'Addition':
        echo "    <tr><td align='right'>+ $bot</td></tr>\n";
        $ans = $top + $bot;
        break;
      case 'Subtraction':
      case 'Subtraction, positive result':
        echo "    <tr><td align='right'>- $bot</td></tr>\n";
        $ans = $top - $bot;
        break;
      }
      switch ($action)
      {
      case 'online':
        echo "    <tr><td align='right' style='border-top: 2px solid black'>\n";
        echo "      <input type='text' class='ans' name='a$ans' id='$field' size='3' />\n";
        echo "    </td></tr>\n";
        $field++;
        break;
      case 'offline':
      default:
        echo "    <tr><td align='right' style='border-top: 2px solid black'>&nbsp;</td></tr>\n";
        break;
      }
      echo "  </table></td>\n";
      $prob = next($problems);
    }
    echo "</tr>\n";
  }
  echo "</table>\n";
  if ($action == 'online')
  {
    $num = $field - 1;
    //echo "<form action='' name='n$num' class='check'>\n";
    echo "<input type='submit' id='$field' name='n$num' value='Done!' />\n";
    echo "</form>";
  }

  // Copyright and links
  echo "<table id='attribution' width='100%'><tr>";
  echo "<td>Copyright (c)2008 by Judebert <a href='http://judebert.com/'>http://judebert.com</a></td>\n";
  echo "<td>Sponsored by <a href='http://judebert.com/'>Judebert.com</a></td>\n";
  echo "<td><a href='http://judebert.com/progress/archives/236-Updated-Online-Math-Worksheet.html'>Comments</a></td>\n";
  echo "</tr></table>\n";

  echo "</div>\n";
  echo "</body>\n";
}

/**
 * Print an error page and stop processing
 */
function error_exit($errmsg)
{
  global $error;
  $error = $errmsg;
  print("<html>\n");
  print_head();
  print_welcome();
  print("</html>\n");
  die(1);
}

/**
 * Print the 'welcome' page with error message, if any, and
 * worksheet configuration control form.
 */
function print_welcome()
{
  global $error;
  global $operations;
  global $actions;
  echo "<body>\n";
  if ($error)
  {
    echo "<div class='error' style='color: red;'>$error</div>\n";
  }
?>
  <h2>Basic Math Worksheet Generator</h2>
  <p>This generates a single-page, vertically-aligned basic math quiz suitable for timed tests.  It performs perfect choosing: each possible problem will appear once before any problems are duplicated.</p>
  <p>You may choose how many columns and rows will appear in the worksheet, as well as the exact numbers used for the top and bottom operands.
    Default values have been provided which produce a 100-question multiplication exam using the numbers 1 through 10 for each multiplicand;
this means all 100 basic multiplication problems are represented once.  (For this purpose, 3 x 1 and 1 x 3 are different, for instance.)</p>
  <p>You may specify a list of values for the top, bottom, or both numbers.
In this case, the top and bottom lists will be permutated to produce all possible combinations.
(For division and subtraction-with-positive-results worksheets, the top list will not be used directly; instead it will be used to create products or sums, providing positive integer results.)</p>
  <p>This means you can produce a worksheet using just the 7 and 8 facts by listing them in the top or bottom list.
  (For division, the bottom will be the divisor; for subtraction with positive results, the bottom will be the smaller value.  If you try to use the top list for just 7 or 8 facts, you'll wind up with problems whose answers are all 7 or 8.)</p>
  <p>If you specify more problems than you provide values for, the values will be reused, but only after all possible problems have been used once.
This ensures that the worksheet difficulty is as consistent as possible, and never results in many trivial problems (multiplication by 1 or 0, for instance).</p>
<form action="" method="post" target="new">
  <table>
  <tr><td align='right'>Title:</td><td><input type="text" name="page_title" value="Timed Test"/></td></tr>
  <tr><td align='right'>Rows x Columns:</td><td><input type="text" size="2" name="rows" value="10"/> x <input type="text" size="2" name="columns" value="10"/></td></tr>
  <tr><td align='right'>Operation:</td>
    <td>
      <select name="operation">
        <?php
        $checked = ' selected="selected"';
        foreach ($operations as $oper)
        {
          echo "<option value='$oper'$checked>$oper</option>\n";
          $checked = '';
        }
        ?>
      </select>
    </td>
  </tr>
  <tr><td align='right'>Test type:</td>
    <td>
      <?php
      $sel = ' checked="checked"';
      foreach ($actions as $action => $desc)
      {
        echo "<input type='radio' name='action' value='$action' id='$action'$sel/><label for='$action'>$desc</label><br />\n";
        $sel = '';
      }
      ?>
    </td>
  </tr>
  <tr>
    <td colspan="2">
    <table border="1">
    <tr><td align="center" valign="middle"><b>Values</b></td><td align="center" valign="top">As a List<br />(separate with commas)</td><td align="center" valign="top">As a Range</td></tr>
    <tr><td>top</td><td><input type="text" name="top_list"/></td><td>From <input type="text" size="2" name="top_min" value="1"/> to <input type="text" size="2" name="top_max" value="10"/></td></tr>
    <tr><td>bottom</td><td><input type="text" name="bot_list"/></td><td>From <input type="text" size="2" name="bot_min" value="1"/> to <input type="text" size="2" name="bot_max" value="10"/></td></tr>
    </table>
    </td>
  </tr>
  </table>
  <div>
    <input type="submit" value="Generate Worksheet"/>
  </div>
</form>
</body>
<?php
}
?>
<!-- vim: set ts=2 sw=2 expandtab: -->
